
import prisma from "../lib/prisma.js";

const VALID_CATEGORIES = [
    "FOOD_SUPPLIES",
    "BEVERAGES",
    "UTILITIES",
    "RENT",
    "SALARIES",
    "EQUIPMENT",
    "CLEANING",
    "TRANSPORT",
    "OTHER",
];

const isValidDate = (value) =>
    !Number.isNaN(new Date(value).getTime());

const toExpenseResponse = (expense) => ({
    ...expense,
    amount: Number(expense.amount),
});

// CREATE EXPENSE
export const createExpense = async (req, res) => {
    try {
        const {
            title,
            description,
            amount,
            category = "OTHER",
            expenseDate,
            notes,
        } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Expense title is required.",
            });
        }

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a positive number.",
            });
        }

        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({
                message: "Invalid expense category.",
                validCategories: VALID_CATEGORIES,
            });
        }

        if (expenseDate && !isValidDate(expenseDate)) {
            return res.status(400).json({
                message: "Invalid expense date.",
            });
        }

        const expense = await prisma.expense.create({
            data: {
                title: title.trim(),
                description: description || null,
                amount: Number(amount).toFixed(2),
                category,
                expenseDate: expenseDate
                    ? new Date(expenseDate)
                    : new Date(),
                notes: notes || null,
                recordedById: req.user.id,
            },
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Expense recorded successfully.",
            expense: toExpenseResponse(expense),
        });
    } catch (error) {
        console.error("CREATE EXPENSE ERROR:", error);

        return res.status(500).json({
            message: "Failed to record expense.",
        });
    }
};

// GET ALL EXPENSES
export const getExpenses = async (req, res) => {
    try {
        const { category, from, to } = req.query;
        const where = {};

        if (category) {
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    message: "Invalid expense category.",
                });
            }

            where.category = category;
        }

        if (from || to) {
            where.expenseDate = {};

            if (from) {
                if (!isValidDate(from)) {
                    return res.status(400).json({
                        message: "Invalid start date.",
                    });
                }

                where.expenseDate.gte = new Date(from);
            }

            if (to) {
                if (!isValidDate(to)) {
                    return res.status(400).json({
                        message: "Invalid end date.",
                    });
                }

                // Include the entire end date when YYYY-MM-DD is provided.
                const endDate = new Date(to);

                if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
                    endDate.setDate(endDate.getDate() + 1);
                    where.expenseDate.lt = endDate;
                } else {
                    where.expenseDate.lte = endDate;
                }
            }
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                expenseDate: "desc",
            },
        });

        const total = expenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        );

        return res.json({
            count: expenses.length,
            total: Number(total.toFixed(2)),
            expenses: expenses.map(toExpenseResponse),
        });
    } catch (error) {
        console.error("GET EXPENSES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch expenses.",
        });
    }
};

// GET ONE EXPENSE
export const getExpenseById = async (req, res) => {
    try {
        const expense = await prisma.expense.findUnique({
            where: { id: req.params.id },
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found.",
            });
        }

        return res.json({
            expense: toExpenseResponse(expense),
        });
    } catch (error) {
        console.error("GET EXPENSE ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch expense.",
        });
    }
};

// UPDATE EXPENSE
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            amount,
            category,
            expenseDate,
            notes,
        } = req.body;

        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({
                message: "Expense not found.",
            });
        }

        const data = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Title cannot be empty.",
                });
            }

            data.title = title.trim();
        }

        if (description !== undefined) {
            data.description = description || null;
        }

        if (notes !== undefined) {
            data.notes = notes || null;
        }

        if (amount !== undefined) {
            if (
                amount === null ||
                amount === "" ||
                !Number.isFinite(Number(amount)) ||
                Number(amount) <= 0
            ) {
                return res.status(400).json({
                    message: "Amount must be a positive number.",
                });
            }

            data.amount = Number(amount).toFixed(2);
        }

        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    message: "Invalid expense category.",
                });
            }

            data.category = category;
        }

        if (expenseDate !== undefined) {
            if (!isValidDate(expenseDate)) {
                return res.status(400).json({
                    message: "Invalid expense date.",
                });
            }

            data.expenseDate = new Date(expenseDate);
        }

        const expense = await prisma.expense.update({
            where: { id },
            data,
            include: {
                recordedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.json({
            message: "Expense updated successfully.",
            expense: toExpenseResponse(expense),
        });
    } catch (error) {
        console.error("UPDATE EXPENSE ERROR:", error);

        return res.status(500).json({
            message: "Failed to update expense.",
        });
    }
};

// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found.",
            });
        }

        await prisma.expense.delete({
            where: { id },
        });

        return res.json({
            message: "Expense deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE EXPENSE ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete expense.",
        });
    }
};
