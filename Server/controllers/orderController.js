import prisma from "../lib/prisma.js";

const VALID_ORDER_STATUSES = Object.freeze([
  "PENDING",
  "TAKEN",       // ✅ Added to match frontend
  "DECLINED",    // ✅ Added to match frontend
  "PREPARING",
  "READY",
  "SERVED",
  "PAID",
  "CANCELLED",
]);

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

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items selected.",
      });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: items.map((item) => item.menuItemId),
        },
      },
    });

    let total = 0;

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

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        tableNumber,
        customerName,
        customerPhone,
        isTakeaway,
        notes,
        total,
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
    const { id } = req.params;
    const normalizedStatus = String(req.body.status ?? "")
      .trim()
      .toUpperCase();

    if (!id) {
      return res.status(400).json({
        message: "Order ID is required.",
      });
    }

    const isAdmin = req.user?.role === "ADMIN";
    const isStaff = req.user?.role === "STAFF";

    if (!isAdmin && !isStaff) {
      return res.status(403).json({
        message: "You are not authorized to update orders.",
      });
    }

    if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    // Staff can only approve a pending order by marking it TAKEN.
    if (isStaff && normalizedStatus !== "TAKEN") {
      return res.status(403).json({
        message: "Waiters can only approve orders.",
      });
    }

    // Ensure staff can only approve orders that are still pending.
    if (isStaff) {
      const result = await prisma.order.updateMany({
        where: {
          id,
          status: "PENDING",
        },
        data: {
          status: "TAKEN",
        },
      });

      if (result.count === 0) {
        const existingOrder = await prisma.order.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!existingOrder) {
          return res.status(404).json({
            message: "Order not found.",
          });
        }

        return res.status(409).json({
          message: "This order has already been processed.",
        });
      }
    } else {
      await prisma.order.update({
        where: { id },
        data: { status: normalizedStatus },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return res.json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(500).json({
      message: "Failed to update order status.",
    });
  }
};

// ===============================
// GET SALES REPORT
// ===============================
// ===============================
// GET SALES REPORT
// ===============================
export const getSalesReport = async (req, res) => {
  try {
    const { period = "daily" } = req.query;

    const now = new Date();
    let startDate;

    if (period === "daily") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "weekly") {
      const day = now.getDay();
      const difference = day === 0 ? 6 : day - 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - difference);
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return res.status(400).json({ message: "Invalid report period." });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "PREPARING", // ✅ Changed from "PAID" to "TAKEN"
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

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    const totalItemsSold = orders.reduce(
      (sum, order) => {
        return (
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
        );
      },
      0
    );

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productMap = {};
    const chartDataMap = {};

    orders.forEach((order) => {
      // Build Best Selling Items Data
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

      // Build Chart Data (Group by time)
      const orderDate = new Date(order.createdAt);
      let label = "";

      if (period === "daily") {
        label = `${orderDate.getHours()}:00`;
      } else if (period === "weekly") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        label = days[orderDate.getDay()];
      } else if (period === "monthly") {
        label = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getDate()}`;
      }

      if (!chartDataMap[label]) {
        chartDataMap[label] = 0;
      }
      chartDataMap[label] += Number(order.total);
    });

    const bestSellingItems = Object.values(productMap).sort(
      (a, b) => b.quantity - a.quantity
    );

    const chartData = Object.keys(chartDataMap).map((label) => ({
      label,
      revenue: chartDataMap[label],
    }));

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
      chartData,
      orders,
    });
  } catch (error) {
    console.error("SALES REPORT ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};