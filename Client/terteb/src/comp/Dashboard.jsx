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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

const salesData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  datasets: [
    {
      label: "Sales",
      data: [4500, 6200, 5200, 8000, 9500, 7000],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: "#3b82f6",
    },
  ],
};

const ordersData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      label: "Orders",
      data: [20, 35, 25, 45, 60],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(59, 130, 246, 0.8)",
      ],
      borderColor: "#3b82f6",
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Dashboard Overview
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-green-600 text-white rounded-2xl p-6 shadow">
          <p>Today's Sales</p>
          <h2 className="text-3xl font-bold mt-2">
            12,500 Birr
          </h2>
        </div>

        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">
          <p>Total Orders</p>
          <h2 className="text-3xl font-bold mt-2">
            156
          </h2>
        </div>

        <div className="bg-purple-600 text-white rounded-2xl p-6 shadow">
          <p>Customers</p>
          <h2 className="text-3xl font-bold mt-2">
            89
          </h2>
        </div>

        <div className="bg-orange-500 text-white rounded-2xl p-6 shadow">
          <p>Menu Items</p>
          <h2 className="text-3xl font-bold mt-2">
            45
          </h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">
            Weekly Sales
          </h2>

          <div style={{ height: "300px" }}>
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">
            Orders
          </h2>

          <div style={{ height: "300px" }}>
            <Bar data={ordersData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-5">
            Order Status
          </h2>

          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span>Completed</span>
              <span>80%</span>
            </div>

            <div className="bg-gray-200 h-3 rounded-full">
              <div className="bg-green-600 h-3 w-[80%] rounded-full"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span>Pending</span>
              <span>20%</span>
            </div>

            <div className="bg-gray-200 h-3 rounded-full">
              <div className="bg-yellow-500 h-3 w-[20%] rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-5">
            Top Selling Foods
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Classic Burger</span>
              <b>120 Orders</b>
            </div>

            <div className="flex justify-between">
              <span>Pizza</span>
              <b>95 Orders</b>
            </div>

            <div className="flex justify-between">
              <span>Chicken</span>
              <b>80 Orders</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}