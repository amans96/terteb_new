import prisma from "../lib/prisma.js";

/**
 * AI TOOL: Get available menu items.
 *
 * Allows the AI agent to search the restaurant menu
 * using real data from PostgreSQL.
 */
export const getMenu = async ({
  search,
  section,
  category,
  maxPrice,
  limit = 20,
} = {}) => {
  // Always exclude unavailable food.
  const where = {
    available: true,
  };

  // Search by food or drink name.
  if (search) {
    const normalizedSearch = String(search).trim();

    if (normalizedSearch.length > 100) {
      throw new Error("Search query is too long.");
    }

    if (normalizedSearch) {
      where.name = {
        contains: normalizedSearch,
        mode: "insensitive",
      };
    }
  }

  // Filter by FOOD or DRINK.
  if (section) {
    const normalizedSection = String(section).toUpperCase();

    if (!["FOOD", "DRINK"].includes(normalizedSection)) {
      throw new Error("Section must be FOOD or DRINK.");
    }

    where.category = {
      ...where.category,
      section: normalizedSection,
    };
  }

  // Filter by category name.
  if (category) {
    const normalizedCategory = String(category).trim();

    if (normalizedCategory.length > 100) {
      throw new Error("Category name is too long.");
    }

    if (normalizedCategory) {
      where.category = {
        ...where.category,
        name: {
          contains: normalizedCategory,
          mode: "insensitive",
        },
      };
    }
  }

  // Filter by maximum price.
  if (maxPrice !== undefined && maxPrice !== null) {
    const price = Number(maxPrice);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Maximum price must be a valid positive number.");
    }

    where.price = {
      lte: price,
    };
  }

  // Restrict how many items the AI can retrieve.
  const safeLimit = Math.min(
    Math.max(Math.floor(Number(limit) || 20), 1),
    30
  );

  const menuItems = await prisma.menuItem.findMany({
    where,

    include: {
      category: {
        select: {
          name: true,
          section: true,
        },
      },
    },

    orderBy: [
      {
        featured: "desc",
      },
      {
        name: "asc",
      },
    ],

    take: safeLimit,
  });

  return menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category.name,
    section: item.category.section,
    featured: item.featured,
  }));
};