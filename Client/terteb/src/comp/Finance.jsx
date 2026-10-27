
import { useCallback, useEffect, useState } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Receipt,
    Calendar,
    RefreshCw,
    Loader2,
    Search,
    Pencil,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    Banknote,
    ChartNoAxesCombined,
} from "lucide-react";

import authService from "../services/authService";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const CATEGORIES = [
    { value: "FOOD_SUPPLIES", label: "Food Supplies" },
    { value: "BEVERAGES", label: "Beverages" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "RENT", label: "Rent" },
    { value: "SALARIES", label: "Salaries" },
    { value: "EQUIPMENT", label: "Equipment" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "TRANSPORT", label: "Transport" },
    { value: "OTHER", label: "Other" },
];

const EMPTY_FORM = {
    title: "",
    description: "",
    amount: "",
    category: "FOOD_SUPPLIES",
    expenseDate: new Date().toLocaleDateString("en-CA"),
    notes: "",
};

const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} Birr`;

const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getCategoryLabel = (value) =>
    CATEGORIES.find((category) => category.value === value)?.label ||
    value ||
    "Other";

export default function Finance() {
    const [activeTab, setActiveTab] = useState("overview");

    const [summary, setSummary] = useState(null);
    const [dailyReport, setDailyReport] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deletingExpense, setDeletingExpense] = useState(null);

    // ==========================================
    // API REQUEST HELPER
    // Uses the same token and API URL pattern
    // as the existing Orders page.
    // ==========================================
    const apiRequest = useCallback(async (endpoint, options = {}) => {
        const token = authService.getToken();

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (response.status === 401) {
            authService.logoutUser();
            window.location.href = "/login";
            throw new Error("Your session has expired. Please log in again.");
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Request failed.");
        }

        return data;
    }, []);

    // ==========================================
    // BUILD DATE FILTERS
    // ==========================================
    const getDateQuery = useCallback(() => {
        const params = new URLSearchParams();

        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);

        const query = params.toString();

        return query ? `?${query}` : "";
    }, [fromDate, toDate]);

    // ==========================================
    // FETCH PROFIT SUMMARY
    // ==========================================
    const fetchSummary = useCallback(async () => {
        const dateQuery = getDateQuery();

        const data = await apiRequest(
            `/profit/summary${dateQuery || "?period=monthly"}`
        );

        setSummary(data);
    }, [apiRequest, getDateQuery]);

    // ==========================================
    // FETCH DAILY REPORT
    // ==========================================
    const fetchDailyReport = useCallback(async () => {
        const dateQuery = getDateQuery();

        const data = await apiRequest(
            `/profit/daily${dateQuery || "?period=monthly"}`
        );

        setDailyReport(data.days || []);
    }, [apiRequest, getDateQuery]);

    // ==========================================
    // FETCH EXPENSES
    // ==========================================
    const fetchExpenses = useCallback(async () => {
        const params = new URLSearchParams();

        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);
        if (categoryFilter) params.set("category", categoryFilter);

        const query = params.toString();

        const data = await apiRequest(
            `/expenses${query ? `?${query}` : ""}`
        );

        setExpenses(data.expenses || []);
    }, [apiRequest, fromDate, toDate, categoryFilter]);

    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================
    const loadFinanceData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                fetchSummary(),
                fetchDailyReport(),
                fetchExpenses(),
            ]);
        } catch (err) {
            console.error("FINANCE FETCH ERROR:", err);
            setError(err.message || "Failed to load financial data.");
        } finally {
            setLoading(false);
        }
    }, [fetchSummary, fetchDailyReport, fetchExpenses]);

    useEffect(() => {
        loadFinanceData();
    }, [loadFinanceData]);

    // ==========================================
    // FORM HANDLERS
    // ==========================================
    const updateForm = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCreateForm = () => {
        setEditingExpense(null);
        setForm({
            ...EMPTY_FORM,
            expenseDate: new Date().toLocaleDateString("en-CA"),
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (expense) => {
        setEditingExpense(expense);

        setForm({
            title: expense.title || "",
            description: expense.description || "",
            amount: String(expense.amount ?? ""),
            category: expense.category || "OTHER",
            expenseDate: expense.expenseDate
                ? new Date(expense.expenseDate).toLocaleDateString("en-CA")
                : "",
            notes: expense.notes || "",
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingExpense(null);
        setForm(EMPTY_FORM);
    };

    // ==========================================
    // CREATE / UPDATE EXPENSE
    // ==========================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                amount: Number(form.amount),
                category: form.category,
                expenseDate: form.expenseDate,
                notes: form.notes.trim() || null,
            };

            const isEditing = Boolean(editingExpense);

            const endpoint = isEditing
                ? `/expenses/${editingExpense.id}`
                : "/expenses";

            const data = await apiRequest(endpoint, {
                method: isEditing ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            });

            setSuccess(
                data.message ||
                (isEditing
                    ? "Expense updated successfully."
                    : "Expense recorded successfully.")
            );

            closeForm();

            await Promise.all([
                fetchSummary(),
                fetchDailyReport(),
                fetchExpenses(),
            ]);
        } catch (err) {
            console.error("SAVE EXPENSE ERROR:", err);
            setError(err.message || "Failed to save expense.");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE EXPENSE
    // ==========================================
    const handleDelete = async (expense) => {
        const confirmed = window.confirm(
            `Delete "${expense.title}" (${formatMoney(expense.amount)})?`
        );

        if (!confirmed) return;

        setDeletingExpense(expense.id);
        setError("");
        setSuccess("");

        try {
            const data = await apiRequest(`/expenses/${expense.id}`, {
                method: "DELETE",
            });

            setSuccess(data.message || "Expense deleted successfully.");

            await Promise.all([
                fetchSummary(),
                fetchDailyReport(),
                fetchExpenses(),
            ]);
        } catch (err) {
            console.error("DELETE EXPENSE ERROR:", err);
            setError(err.message || "Failed to delete expense.");
        } finally {
            setDeletingExpense(null);
        }
    };

    // ==========================================
    // FILTER EXPENSES BY SEARCH
    // ==========================================
    const filteredExpenses = expenses.filter((expense) => {
        const search = searchTerm.toLowerCase();

        return (
            expense.title?.toLowerCase().includes(search) ||
            expense.description?.toLowerCase().includes(search) ||
            expense.notes?.toLowerCase().includes(search) ||
            getCategoryLabel(expense.category).toLowerCase().includes(search)
        );
    });

    const totals = summary?.summary || {};

    const revenue = Number(totals.revenue || 0);
    const expenseTotal = Number(totals.expenses || 0);
    const profit = Number(totals.profit || 0);

    // ==========================================
    // LOADING STATE
    // ==========================================
    if (loading && !summary) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">
                    Loading financial dashboard...
                </p>
            </div>
        );
    }

    // ==========================================
    // MAIN DASHBOARD
    // ==========================================
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Financial Management
                    </h1>

                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Track Terteb's expenses, revenue and profit
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={loadFinanceData}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateForm}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* FEEDBACK */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={() => setError("")}
                        className="ml-auto hover:text-red-900"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                    <button
                        onClick={() => setSuccess("")}
                        className="ml-auto hover:text-emerald-900"
                        aria-label="Dismiss success"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* DATE FILTERS */}
            <div className="bg-white p-4 sm:p-5 border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold lg:mr-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        Report period
                    </div>

                    <div className="flex-1">
                        <label
                            htmlFor="fromDate"
                            className="block text-xs font-semibold text-gray-500 mb-2"
                        >
                            FROM
                        </label>
                        <input
                            id="fromDate"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(event) => setFromDate(event.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex-1">
                        <label
                            htmlFor="toDate"
                            className="block text-xs font-semibold text-gray-500 mb-2"
                        >
                            TO
                        </label>
                        <input
                            id="toDate"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(event) => setToDate(event.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <button
                        onClick={loadFinanceData}
                        disabled={loading}
                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50"
                    >
                        Apply Filters
                    </button>

                    <button
                        onClick={() => {
                            setFromDate("");
                            setToDate("");
                            setCategoryFilter("");
                            setSearchTerm("");
                        }}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                        Clear
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                    Choose a date range and select Apply Filters to refresh the reports.
                </p>
            </div>

            {/* NAVIGATION TABS */}
            <div className="inline-flex w-full sm:w-auto bg-gray-200/70 p-1 rounded-xl">
                {[
                    { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
                    { id: "expenses", label: "Expenses", icon: Receipt },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${active
                                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* =====================================
          OVERVIEW TAB
      ====================================== */}
            {activeTab === "overview" && (
                <div className="space-y-8">
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <SummaryCard
                            title="Paid Revenue"
                            value={formatMoney(revenue)}
                            subtitle={`${totals.paidOrderCount || 0} paid orders`}
                            icon={Banknote}
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        <SummaryCard
                            title="Total Expenses"
                            value={formatMoney(expenseTotal)}
                            subtitle={`${totals.expenseCount || 0} expense records`}
                            icon={Receipt}
                            iconClass="bg-amber-50 text-amber-600"
                        />

                        <SummaryCard
                            title="Calculated Profit"
                            value={formatMoney(profit)}
                            subtitle="Revenue minus recorded expenses"
                            icon={TrendingUp}
                            iconClass={
                                profit >= 0
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                            }
                            valueClass={profit < 0 ? "text-red-600" : "text-gray-900"}
                        />

                        <SummaryCard
                            title="Items Sold"
                            value={Number(totals.totalItemsSold || 0).toLocaleString()}
                            subtitle="Items in paid orders"
                            icon={Wallet}
                            iconClass="bg-purple-50 text-purple-600"
                        />
                    </div>

                    {/* FINANCIAL BREAKDOWN */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-7">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Financial Breakdown
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Revenue compared with recorded expenses
                                </p>
                            </div>

                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                {formatDate(summary?.startDate)} –{" "}
                                {formatDate(summary?.endDate)}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <BreakdownBar
                                label="Paid Revenue"
                                value={revenue}
                                max={Math.max(revenue, expenseTotal, 1)}
                                color="bg-blue-500"
                            />

                            <BreakdownBar
                                label="Recorded Expenses"
                                value={expenseTotal}
                                max={Math.max(revenue, expenseTotal, 1)}
                                color="bg-amber-500"
                            />

                            <BreakdownBar
                                label="Calculated Profit"
                                value={Math.abs(profit)}
                                max={Math.max(revenue, expenseTotal, 1)}
                                color={profit >= 0 ? "bg-emerald-500" : "bg-red-500"}
                                displayValue={formatMoney(profit)}
                            />
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
                            <p className="font-semibold text-gray-700 mb-1">
                                How this is calculated
                            </p>
                            Paid revenue minus recorded expenses. This is an operational
                            estimate, not formal accounting profit. Only orders marked as
                            paid by your backend are included.
                        </div>
                    </div>

                    {/* DAILY REPORT */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                Daily Financial Report
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Revenue, expenses and profit grouped by date
                            </p>
                        </div>

                        {dailyReport.length === 0 ? (
                            <div className="text-center py-14 px-4">
                                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="font-semibold text-gray-800">
                                    No financial activity found
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Try another date range or record an expense.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-5 py-4">Date</th>
                                            <th className="px-5 py-4">Revenue</th>
                                            <th className="px-5 py-4">Expenses</th>
                                            <th className="px-5 py-4">Profit</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {[...dailyReport].reverse().map((day) => (
                                            <tr
                                                key={day.date}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-800">
                                                    {formatDate(day.date)}
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap text-blue-700 font-semibold">
                                                    {formatMoney(day.revenue)}
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap text-amber-700 font-semibold">
                                                    {formatMoney(day.expenses)}
                                                </td>

                                                <td
                                                    className={`px-5 py-4 whitespace-nowrap font-bold ${Number(day.profit) < 0
                                                        ? "text-red-600"
                                                        : "text-emerald-700"
                                                        }`}
                                                >
                                                    {formatMoney(day.profit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =====================================
          EXPENSES TAB
      ====================================== */}
            {activeTab === "expenses" && (
                <div className="space-y-5">
                    {/* EXPENSE FILTERS */}
                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">
                                    SEARCH EXPENSES
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search title, description or category..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">
                                    CATEGORY
                                </label>

                                <select
                                    value={categoryFilter}
                                    onChange={(event) =>
                                        setCategoryFilter(event.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">All categories</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-bold text-gray-900">
                                    {filteredExpenses.length}
                                </span>{" "}
                                expense records
                            </p>

                            <p className="text-sm font-bold text-gray-900">
                                Total listed:{" "}
                                <span className="text-amber-700">
                                    {formatMoney(
                                        filteredExpenses.reduce(
                                            (sum, expense) => sum + Number(expense.amount || 0),
                                            0
                                        )
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* EXPENSE LIST */}
                    {filteredExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Receipt className="w-8 h-8 text-gray-300" />
                            </div>

                            <p className="text-lg font-bold text-gray-900 mb-1">
                                No expenses found
                            </p>

                            <p className="text-gray-500 text-sm mb-5 text-center px-4">
                                Record a new expense or adjust your filters.
                            </p>

                            <button
                                onClick={openCreateForm}
                                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add First Expense
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-5 py-4">Expense</th>
                                            <th className="px-5 py-4">Category</th>
                                            <th className="px-5 py-4">Date</th>
                                            <th className="px-5 py-4">Recorded By</th>
                                            <th className="px-5 py-4">Amount</th>
                                            <th className="px-5 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredExpenses.map((expense) => (
                                            <tr
                                                key={expense.id}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-gray-900">
                                                        {expense.title}
                                                    </p>
                                                    {expense.description && (
                                                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                                            {expense.description}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                                                        {getCategoryLabel(expense.category)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(expense.expenseDate)}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {expense.recordedBy?.name || "Unknown"}
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900">
                                                    {formatMoney(expense.amount)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditForm(expense)}
                                                            title="Edit expense"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(expense)}
                                                            disabled={deletingExpense === expense.id}
                                                            title="Delete expense"
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {deletingExpense === expense.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE EXPENSE CARDS */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {filteredExpenses.map((expense) => (
                                    <div key={expense.id} className="p-4 space-y-3">
                                        <div className="flex justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 break-words">
                                                    {expense.title}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(expense.expenseDate)}
                                                </p>
                                            </div>

                                            <p className="font-extrabold text-gray-900 whitespace-nowrap">
                                                {formatMoney(expense.amount)}
                                            </p>
                                        </div>

                                        {expense.description && (
                                            <p className="text-sm text-gray-500">
                                                {expense.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                                                {getCategoryLabel(expense.category)}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditForm(expense)}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(expense)}
                                                    disabled={deletingExpense === expense.id}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400">
                                            Recorded by: {expense.recordedBy?.name || "Unknown"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* =====================================
          CREATE / EDIT EXPENSE MODAL
      ====================================== */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 sm:px-7 py-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingExpense ? "Edit Expense" : "Record New Expense"}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Enter the expense details below.
                                </p>
                            </div>

                            <button
                                onClick={closeForm}
                                disabled={saving}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                aria-label="Close form"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Expense Title *
                                </label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={updateForm}
                                    required
                                    maxLength={150}
                                    placeholder="e.g. Vegetable purchase"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Amount (Birr) *
                                    </label>

                                    <input
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={updateForm}
                                        required
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={updateForm}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {CATEGORIES.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Expense Date *
                                    </label>

                                    <input
                                        name="expenseDate"
                                        type="date"
                                        value={form.expenseDate}
                                        onChange={updateForm}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>

                                    <input
                                        name="description"
                                        value={form.description}
                                        onChange={updateForm}
                                        maxLength={500}
                                        placeholder="Optional details"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={updateForm}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Additional information..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-y outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingExpense
                                            ? "Save Changes"
                                            : "Record Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// REUSABLE SUMMARY CARD
// ==========================================
function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
    valueClass = "text-gray-900",
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-500">{title}</p>
                    <p
                        className={`text-2xl font-extrabold mt-3 tracking-tight break-words ${valueClass}`}
                    >
                        {value}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
                </div>

                <div className={`p-3 rounded-xl shrink-0 ${iconClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// ==========================================
// REUSABLE BREAKDOWN BAR
// ==========================================
function BreakdownBar({
    label,
    value,
    max,
    color,
    displayValue,
}) {
    const percentage = Math.min(
        100,
        Math.max(0, (Number(value || 0) / max) * 100)
    );

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">
                    {displayValue || formatMoney(value)}
                </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
