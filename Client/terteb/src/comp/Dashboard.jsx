import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Utensils,
  AlertCircle,
  Loader2,
  Trophy,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
    const API_URL = import.meta.env.VITE_API_URL;
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");



const [ordersResponse, menuResponse] = await Promise.all([
  fetch(`${API_URL}/api/orders`),
  fetch(`${API_URL}/api/menu`),
]);

      if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
      if (!menuResponse.ok) throw new Error("Failed to fetch menu");

      const ordersData = await ordersResponse.json();
      const menuData = await menuResponse.json();

      setOrders(ordersData);
      setMenuItems(menuData);
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-50/50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading dashboard insights...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-red-900 mb-1">
              Failed to load dashboard
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DATA PROCESSING
  // ==========================================
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const takenOrders = orders.filter((order) => order.status === "TAKEN");

  const todaysTakenOrders = takenOrders.filter((order) => {
    const date = new Date(order.createdAt);
    return date >= todayStart && date < todayEnd;
  });

  const todaysSales = todaysTakenOrders.reduce(
    (total, order) => total + Number(order.total),
    0
  );

  const customers = new Set();
  orders.forEach((order) => {
    if (order.customerPhone) customers.add(order.customerPhone);
    else if (order.customerName) customers.add(order.customerName);
  });
  const totalCustomers = customers.size;

  // ==========================================
  // WEEK DATA (CHARTS)
  // ==========================================
  const day = today.getDay();
  const difference = day === 0 ? 6 : day - 1;
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - difference);
  weekStart.setHours(0, 0, 0, 0);

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklySales = [0, 0, 0, 0, 0, 0, 0];
  const weeklyOrders = [0, 0, 0, 0, 0, 0, 0];

  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= weekStart && orderDate < todayEnd) {
      const orderDay = orderDate.getDay();
      const index = orderDay === 0 ? 6 : orderDay - 1;

      weeklyOrders[index] += 1;
      if (order.status === "TAKEN") {
        weeklySales[index] += Number(order.total);
      }
    }
  });

  // ==========================================
  // CHART CONFIGURATIONS
  // ==========================================
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#6b7280', font: { family: "'Inter', sans-serif" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6', drawBorder: false, borderDash: [5, 5] },
        ticks: { color: '#9ca3af', font: { family: "'Inter', sans-serif" }, maxTicksLimit: 6 },
      },
    },
  };

  const salesData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Sales",
        data: weeklySales,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const ordersData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Orders",
        data: weeklyOrders,
        backgroundColor: "#6366f1",
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  // ==========================================
  // ORDER STATUS PERCENTAGES
  // ==========================================
  const totalOrderCount = orders.length;
  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const declinedCount = orders.filter((order) => order.status === "DECLINED").length;

  const takenPercentage = totalOrderCount > 0 ? Math.round((takenOrders.length / totalOrderCount) * 100) : 0;
  const pendingPercentage = totalOrderCount > 0 ? Math.round((pendingCount / totalOrderCount) * 100) : 0;
  const declinedPercentage = totalOrderCount > 0 ? Math.round((declinedCount / totalOrderCount) * 100) : 0;

  // ==========================================
  // TOP SELLING FOODS
  // ==========================================
  const productMap = {};
  takenOrders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.menuItemId;
      if (!productMap[id]) {
        productMap[id] = { name: item.menuItem?.name || "Unknown item", quantity: 0 };
      }
      productMap[id].quantity += Number(item.quantity);
    });
  });

  const topSellingFoods = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your restaurant today.</p>
      </div>

      {/* ==============================
          SUMMARY CARDS
      ============================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* SALES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Today</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {todaysSales.toLocaleString()} <span className="text-lg font-medium text-gray-500">Birr</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {todaysTakenOrders.length} completed orders
          </p>
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">All Time</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {orders.length.toLocaleString()}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Total orders received
          </p>
        </div>

        {/* CUSTOMERS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">All Time</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {totalCustomers.toLocaleString()}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Unique customers
          </p>
        </div>

        {/* MENU ITEMS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {menuItems.length}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Items on your menu
          </p>
        </div>
      </div>

      {/* ==============================
          CHARTS
      ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SALES CHART */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Weekly Revenue</h2>
            <p className="text-sm text-gray-500 mt-1">Income from taken orders this week</p>
          </div>
          <div className="h-[300px] w-full">
            <Line 
              data={salesData} 
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `${Number(context.raw).toLocaleString()} Birr`,
                    },
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* ORDERS CHART */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Order Volume</h2>
            <p className="text-sm text-gray-500 mt-1">Total orders placed per day</p>
          </div>
          <div className="h-[300px] w-full">
            <Bar 
              data={ordersData} 
              options={{
                ...commonChartOptions,
                scales: {
                  ...commonChartOptions.scales,
                  y: { ...commonChartOptions.scales.y, ticks: { ...commonChartOptions.scales.y.ticks, precision: 0 } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* ==============================
          BOTTOM ROW
      ============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ORDER STATUS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900">Order Status Breakdown</h2>
            <p className="text-sm text-gray-500 mt-1">Fulfillment rates across all orders</p>
          </div>

          <div className="space-y-6 flex-1 justify-center flex flex-col">
            {/* TAKEN */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Completed
                </span>
                <span className="font-bold text-gray-900">{takenPercentage}%</span>
              </div>
              <div className="bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${takenPercentage}%` }} 
                />
              </div>
            </div>

            {/* PENDING */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending
                </span>
                <span className="font-bold text-gray-900">{pendingPercentage}%</span>
              </div>
              <div className="bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${pendingPercentage}%` }} 
                />
              </div>
            </div>

            {/* DECLINED */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Declined
                </span>
                <span className="font-bold text-gray-900">{declinedPercentage}%</span>
              </div>
              <div className="bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${declinedPercentage}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOP SELLING FOODS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Selling Items</h2>
              <p className="text-sm text-gray-500 mt-1">Most popular menu choices</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          {topSellingFoods.length > 0 ? (
            <div className="space-y-4">
              {topSellingFoods.map((food, index) => (
                <div 
                  key={food.name} 
                  className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mr-4 transition-colors
                    ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                      index === 1 ? 'bg-gray-200 text-gray-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-700' : 
                      'bg-gray-50 text-gray-500 group-hover:bg-gray-200'}`}
                  >
                    #{index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {food.name}
                    </p>
                  </div>
                  
                  <div className="text-right pl-4">
                    <p className="font-bold text-indigo-600">
                      {food.quantity}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      Sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Utensils className="w-12 h-12 mb-3 text-gray-200" />
              <p>No item data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}