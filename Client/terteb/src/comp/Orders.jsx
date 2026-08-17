import { useEffect, useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Utensils, 
  Loader2,
  Inbox
} from "lucide-react";
import authService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          authService.logoutUser();
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // DEBUG VERSION OF UPDATE STATUS
  // ==========================================
  const updateStatus = async (id, status) => {
    try {
      console.log(`🟡 1. Attempting to update order ${id} to status: ${status}`);
      setUpdatingOrder(id);
      const token = authService.getToken();
      
      const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      console.log(`🟡 2. Backend responded with HTTP Status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error("🔴 401 Unauthorized - redirecting to login");
          authService.logoutUser();
          window.location.href = '/login';
          return;
        }
        
        // 🚨 DEBUG: Grab the exact error message from the backend!
        const errorData = await response.text(); 
        console.error("🔴 3. BACKEND ERROR DETAILS:", errorData);
        
        // Show an alert on the screen so you can't miss it
        alert(`Backend Error (${response.status}):\n\n${errorData}`);
        
        throw new Error(`Server returned ${response.status}: ${errorData}`);
      }

      console.log("🟢 4. Update successful!");
      
      // Optimistically update UI
      setOrders((prev) => 
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );

      if (status === "PREPARING") setActiveTab("PREPARING");
      if (status === "CANCELLED") setActiveTab("PENDING");

      fetchOrders(); 
    } catch (error) {
      console.error("🔴 5. CATCH BLOCK TRIGGERED:", error);
    } finally {
      setUpdatingOrder(null);
    }
  };
  // ==========================================

  const getGroupLabel = (dateString) => {
    if (!dateString) return "Unknown Date";
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, tomorrow)) return "Tomorrow";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredOrders = orders
    .filter((order) => order.status === activeTab)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const label = getGroupLabel(order.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(order);
    return acc;
  }, {});

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const takenCount = orders.filter((o) => o.status === "PREPARING").length;

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Utensils className="w-4 h-4" /> Manage and process incoming tickets
          </p>
        </div>

        <div className="inline-flex bg-gray-200/70 p-1 rounded-xl w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "PENDING"
                ? "bg-white text-amber-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === 'PENDING' ? 'bg-amber-100' : 'bg-gray-300'}`}>
              {pendingCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("PREPARING")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "PREPARING"
                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Accepted
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === 'PREPARING' ? 'bg-emerald-100' : 'bg-gray-300'}`}>
              {takenCount}
            </span>
          </button>
        </div>
      </div>

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No orders found</p>
          <p className="text-gray-500 text-sm">
            {activeTab === "PENDING" ? "You're all caught up! No pending orders right now." : "No orders have been accepted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedOrders).map(([dateLabel, dateOrders]) => (
            <div key={dateLabel} className="space-y-4">
              
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">{dateLabel}</h2>
                <span className="text-sm font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                  {dateOrders.length} {dateOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>

              <div className="hidden md:block bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50">
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4 w-1/3">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dateOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                          {order.createdAt && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            order.isTakeaway ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.isTakeaway ? "Takeaway" : `Table ${order.tableNumber}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm flex items-center justify-between text-gray-700">
                                <span className="font-medium">{item.menuItem.name}</span>
                                <span className="text-gray-400">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">{order.total.toLocaleString()} Birr</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {order.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={updatingOrder === order.id}
                                onClick={() => updateStatus(order.id, "CANCELLED")}
                                className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Decline
                              </button>
                              <button
                                disabled={updatingOrder === order.id}
                                onClick={() => updateStatus(order.id, "PREPARING")}
                                className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                              >
                                {updatingOrder === order.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                Accept
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-4 h-4" />
                              Accepted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {dateOrders.map((order) => (
                  <div key={order.id} className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                      <div>
                        <span className="font-bold text-gray-900 text-lg">#{order.orderNumber}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            order.isTakeaway ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.isTakeaway ? "Takeaway" : `Table ${order.tableNumber}`}
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-600">{order.total.toLocaleString()} Birr</span>
                    </div>

                    <div className="p-4 pt-0">
                      {order.status === "PENDING" ? (
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button
                            disabled={updatingOrder === order.id}
                            onClick={() => updateStatus(order.id, "CANCELLED")}
                            className="flex-1 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            disabled={updatingOrder === order.id}
                            onClick={() => updateStatus(order.id, "PREPARING")}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {updatingOrder === order.id && <Loader2 className="w-4 h-4 animate-spin" />}
                            Accept Order
                          </button>
                        </div>
                      ) : (
                        <div className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl mt-4">
                          <CheckCircle2 className="w-4 h-4" />
                          Order Accepted
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}