import prisma from "../lib/prisma.js";

export const createCategory = async (req, res) => {
  try {
    const { name, section } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        message: "Name and section are required",
      });
    }

    const formattedName =
      name.trim().charAt(0).toUpperCase() +
      name.trim().slice(1).toLowerCase();

    const category = await prisma.menuCategory.create({
      data: {
        name: formattedName,
        section,
      },
    });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const category = await prisma.menuCategory.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: {
        id,
      },
      data: {
        name: name
          ? name.trim().charAt(0).toUpperCase() +
            name.trim().slice(1).toLowerCase()
          : category.name,
        image: image ?? category.image,
      },
    });

    res.status(200).json(updatedCategory);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await prisma.menuCategory.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};