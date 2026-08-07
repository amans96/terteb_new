import prisma from "../lib/prisma.js";

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

    // Fetch menu items
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: items.map((item) => item.menuItemId),
        },
      },
    });

    let total = 0;

    const orderItems = items.map((item) => {
      const food = menuItems.find((m) => m.id === item.menuItemId);

      if (!food) {
        throw new Error("Food not found");
      }

      const price = Number(food.price);
      const subtotal = price * item.quantity;

      total += subtotal;

      return {
        menuItemId: food.id,
        quantity: item.quantity,
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
    res.status(500).json({
      message: err.message,
    });
  }
};
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
    res.status(500).json({
      message: err.message,
    });
  }
};
export const updateOrderStatus = async (req,res)=>{
  try {

    const {status} = req.body;

    const order = await prisma.order.update({
      where:{
        id:req.params.id
      },
      data:{
        status
      }
    });


    res.json({
      message:"Order updated",
      order
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};