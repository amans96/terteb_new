
import prisma from "../lib/prisma.js";

export const getDateRange = ({
    period = "daily",
    from,
    to,
} = {}) => {
    const now = new Date();

    if (from || to) {
        const start = from
            ? new Date(from)
            : new Date(2000, 0, 1);

        const end = to
            ? new Date(to)
            : now;

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            throw new Error("Invalid report date.");
        }

        if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
            start.setHours(0, 0, 0, 0);
        }

        // Exclusive end boundary includes the complete end date.
        if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
            end.setDate(end.getDate() + 1);
            end.setHours(0, 0, 0, 0);
        } else if (!to) {
            end.setTime(now.getTime() + 1);
        }

        if (start >= end) {
            throw new Error("Start date must be before end date.");
        }

        return { start, end };
    }

    const start = new Date(now);

    if (period === "daily") {
        start.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
        const day = start.getDay();
        const daysSinceMonday = day === 0 ? 6 : day - 1;

        start.setDate(start.getDate() - daysSinceMonday);
        start.setHours(0, 0, 0, 0);
    } else if (period === "monthly") {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    } else {
        throw new Error(
            "Invalid period. Use daily, weekly, or monthly."
        );
    }

    return {
        start,
        end: new Date(now.getTime() + 1),
    };
};

export const getProfitData = async (options = {}) => {
    const { start, end } = getDateRange(options);

    const dateFilter = {
        gte: start,
        lt: end,
    };

    const [paidOrders, expenseAggregate, expenseCount] =
        await Promise.all([
            prisma.order.findMany({
                where: {
                    paid: true,
                    status: {
                        notIn: ["CANCELLED", "DECLINED"],
                    },
                    createdAt: dateFilter,
                },
                select: {
                    id: true,
                    orderNumber: true,
                    total: true,
                    createdAt: true,
                    items: {
                        select: {
                            quantity: true,
                            subtotal: true,
                            menuItem: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            }),

            prisma.expense.aggregate({
                where: {
                    expenseDate: dateFilter,
                },
                _sum: {
                    amount: true,
                },
            }),

            prisma.expense.count({
                where: {
                    expenseDate: dateFilter,
                },
            }),
        ]);

    const revenue = paidOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
    );

    const expenses = Number(
        expenseAggregate._sum.amount ?? 0
    );

    const profit = revenue - expenses;

    const totalItemsSold = paidOrders.reduce(
        (sum, order) =>
            sum +
            order.items.reduce(
                (itemSum, item) => itemSum + item.quantity,
                0
            ),
        0
    );

    return {
        period: options.period || "custom",
        startDate: start,
        endDate: new Date(end.getTime() - 1),
        summary: {
            paidOrderCount: paidOrders.length,
            totalItemsSold,
            revenue: Number(revenue.toFixed(2)),
            expenses: Number(expenses.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            expenseCount,
        },
        orders: paidOrders.map((order) => ({
            ...order,
            total: Number(order.total),
            items: order.items.map((item) => ({
                ...item,
                subtotal: Number(item.subtotal),
            })),
        })),
    };
};

export const getDailyProfitData = async (options = {}) => {
    const report = await getProfitData({
        ...options,
        period: options.period || "monthly",
    });

    const dailyMap = new Map();

    const getKey = (date) => {
        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const ensureDay = (key) => {
        if (!dailyMap.has(key)) {
            dailyMap.set(key, {
                date: key,
                revenue: 0,
                expenses: 0,
                profit: 0,
            });
        }

        return dailyMap.get(key);
    };

    for (const order of report.orders) {
        const day = ensureDay(getKey(order.createdAt));
        day.revenue += order.total;
    }

    // Re-read expenses so daily expenses can be grouped separately.
    const expenses = await prisma.expense.findMany({
        where: {
            expenseDate: {
                gte: report.startDate,
                lte: report.endDate,
            },
        },
        select: {
            amount: true,
            expenseDate: true,
        },
    });

    for (const expense of expenses) {
        const day = ensureDay(getKey(expense.expenseDate));
        day.expenses += Number(expense.amount);
    }

    const days = [...dailyMap.values()]
        .map((day) => ({
            ...day,
            revenue: Number(day.revenue.toFixed(2)),
            expenses: Number(day.expenses.toFixed(2)),
            profit: Number(
                (day.revenue - day.expenses).toFixed(2)
            ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        startDate: report.startDate,
        endDate: report.endDate,
        days,
    };
};
