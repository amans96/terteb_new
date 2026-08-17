import prisma from "../lib/prisma.js";

// Create food
export const createMenuItems = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const food = await prisma.menuItem.create({
            data: req.body
        });

        res.status(201).json(food);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Get all foods
export const getMenuItems = async (req, res) => {
    try {
        const foods = await prisma.menuItem.findMany({
            include: {
                category: true
            }
        });

        res.json(foods);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get single food
export const getMenuItem = async (req, res) => {
    try {
        const food = await prisma.menuItem.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                category: true
            }
        });

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        res.json(food);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update food
export const updateMenuItem = async (req, res) => {
    try {
        const food = await prisma.menuItem.update({
            where: {
                id: req.params.id
            },
            data: req.body
        });

        res.json(food);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete food (FIXED TO HARD DELETE)
export const deleteMenuItems = async (req, res) => {
  try {
    const item = await prisma.menuItem.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      message: "Food permanently removed from the menu",
      item,
    });
  } catch (error) {
    console.error("DELETE MENU ITEM ERROR:", error);
    
    // Check if Prisma blocked the deletion because of existing orders
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: "Cannot delete this food because it is attached to past orders. Please edit it to be unavailable instead.",
      });
    }

    res.status(500).json({
      message: error.message,
      error: error.code,
    });
  }
};