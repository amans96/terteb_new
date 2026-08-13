import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Receipt, 
  AlertCircle, 
  Loader2,
  Calendar,
  ChevronRight
} from "lucide-react";

export default function Sales() {
  const [period, setPeriod] = useState("daily");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
  // FETCH REPORT
  // ===============================
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/orders/reports?period=${period}`
      );

      if (!response.ok) {
        throw new Error("Failed to load sales report");
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("SALES REPORT ERROR:", error);
      setError(error.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD WHEN PERIOD CHANGES
  // ===============================
  useEffect(() => {
    fetchReport();
  }, [period]);

  // ===============================
  // FORMAT MONEY
  // ===============================
  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString()} Birr`;
  };

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Gathering your sales data...
        </p>
      </div>
    );
  }

  // ===============================
  // ERROR STATE
  // ===============================
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-red-900 mb-1">
              Failed to load report
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchReport}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const bestSellingItems = report?.bestSellingItems || [];
  const chartData = report?.chartData || [];

  // ===============================
  // MAIN PAGE
  // ===============================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      
      {/* ==============================
          HEADER & CONTROLS
      ============================== */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Sales Overview
          </h1>
          <p className="text-gray-500 mt-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Track your restaurant's financial performance
          </p>
        </div>

        {/* PERIOD SEGMENTED CONTROL */}
        <div className="inline-flex bg-gray-200/70 p-1 rounded-xl w-full sm:w-auto overflow-hidden">
          {["daily", "weekly", "monthly"].map((option) => (
            <button
              key={option}
              onClick={() => setPeriod(option)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                period === option
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* ==============================
          SUMMARY CARDS
      ============================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* REVENUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatMoney(summary.totalRevenue)}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium capitalize flex items-center gap-1">
            <span className="text-emerald-500">↑</span> {period} sales
          </p>
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">Orders Taken</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {summary.totalOrders || 0}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">Completed orders</p>
        </div>

        {/* ITEMS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">Items Sold</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {summary.totalItemsSold || 0}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">Total quantity</p>
        </div>

        {/* AVERAGE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">Average Order</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatMoney(summary.averageOrderValue)}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">Per transaction</p>
        </div>
      </div>

      {/* ==============================
          CHART + BEST SELLING
      ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500 mt-1">
                {period === "daily" ? "Today's timeline" : period === "weekly" ? "This week's performance" : "This month's overview"}
              </p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full flex-1 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${Number(value).toLocaleString()} Birr`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[320px]">
              <TrendingUp className="w-12 h-12 mb-3 text-gray-200" />
              <p>No revenue data for this period.</p>
            </div>
          )}
        </div>

        {/* BEST SELLING */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Items</h2>
              <p className="text-sm text-gray-500 mt-1">Most ordered menu items</p>
            </div>
          </div>

          {bestSellingItems.length > 0 ? (
            <div className="space-y-5 flex-1">
              {bestSellingItems.slice(0, 7).map((item, index) => (
                <div key={item.menuItemId} className="flex items-center gap-4 group">
                  {/* RANK */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                    ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' : 
                      index === 2 ? 'bg-orange-50 text-orange-700' : 
                      'bg-gray-50 text-gray-500 group-hover:bg-gray-100'}`}>
                    #{index + 1}
                  </div>

                  {/* ITEM DETAILS */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} orders
                    </p>
                  </div>

                  {/* REVENUE */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatMoney(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Package className="w-12 h-12 mb-3 text-gray-200" />
              <p>No items sold yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==============================
          RECENT ORDERS TABLE
      ============================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Detailed log of orders in this period</p>
          </div>
        </div>

        {report?.orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {order.items.slice(0, 2).map((item) => (
                          <span key={item.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-bold text-gray-900">
                        {formatMoney(order.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center bg-gray-50/30">
            <Receipt className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-900 font-medium">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">Completed orders will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}