import prisma from "../lib/prisma.js";

// ===============================
// CREATE ORDER
// ===============================
export const createOrder = async (req, res) => {
  try {
    const {
      tableNumber,
      customerName,
      customerPhone,
      isTakeaway,
      notes,
      items,
    } = req.body;

    // Make sure there are items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items selected.",
      });
    }

    // Get menu items from database
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: items.map((item) => item.menuItemId),
        },
      },
    });

    let total = 0;

    // Create order items
    const orderItems = items.map((item) => {
      const food = menuItems.find(
        (menuItem) => menuItem.id === item.menuItemId
      );

      if (!food) {
        throw new Error(`Food not found: ${item.menuItemId}`);
      }

      const price = Number(food.price);
      const quantity = Number(item.quantity);
      const subtotal = price * quantity;

      total += subtotal;

      return {
        menuItemId: food.id,
        quantity,
        price,
        subtotal,
      };
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        tableNumber,
        customerName,
        customerPhone,
        isTakeaway,
        notes,
        total,

        // Every new order starts as PENDING
        status: "PENDING",

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// GET ALL ORDERS
// ===============================
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },

      // Newest orders first
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// UPDATE ORDER STATUS
// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "DECLINED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await prisma.order.update({
      where: {
        id: req.params.id,
      },

      data: {
        status,
      },

      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// ===============================
// GET SALES REPORT
// ===============================
export const getSalesReport = async (req, res) => {
  try {
    const { period = "daily" } = req.query;

const now = new Date("2026-08-13T18:00:00");

    let startDate;

    // DAILY
    if (period === "daily") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
    }

    // WEEKLY
    else if (period === "weekly") {
      const day = now.getDay();

      const difference = day === 0 ? 6 : day - 1;

      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - difference
      );
    }

    // MONTHLY
    else if (period === "monthly") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    else {
      return res.status(400).json({
        message: "Invalid report period.",
      });
    }

    // Only TAKEN orders count as sales
    const orders = await prisma.order.findMany({
      where: {
        status: "TAKEN",

        createdAt: {
          gte: startDate,
          lte: now,
        },
      },

      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    // ===============================
    // TOTAL ORDERS
    // ===============================

    const totalOrders = orders.length;

    // ===============================
    // TOTAL REVENUE
    // ===============================

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    // ===============================
    // TOTAL ITEMS SOLD
    // ===============================

    const totalItemsSold = orders.reduce(
      (sum, order) => {
        return (
          sum +
          order.items.reduce(
            (itemSum, item) => itemSum + item.quantity,
            0
          )
        );
      },
      0
    );

    // ===============================
    // AVERAGE ORDER
    // ===============================

    const averageOrderValue =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    // ===============================
    // BEST SELLING ITEMS
    // ===============================

    const productMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item.menuItemId;

        if (!productMap[id]) {
          productMap[id] = {
            menuItemId: id,
            name: item.menuItem.name,
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[id].quantity += item.quantity;

        productMap[id].revenue += Number(item.subtotal);
      });
    });

    const bestSellingItems = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity);

    // ===============================
    // SEND REPORT
    // ===============================

    res.json({
      period,

      startDate,
      endDate: now,

      summary: {
        totalOrders,
        totalRevenue,
        totalItemsSold,
        averageOrderValue,
      },

      bestSellingItems,

      orders,
    });

  } catch (error) {
    console.error("SALES REPORT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};