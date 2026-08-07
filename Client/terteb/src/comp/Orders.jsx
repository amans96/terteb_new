import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/orders"
      );

      if (!response.ok) {
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

  const updateStatus = async (id, status) => {
    try {
      await fetch(
        `http://localhost:5000/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status
          })
        }
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Orders
      </h1>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Order No</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">{order.orderNumber}</td>
                <td className="p-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="mb-2 rounded-lg bg-gray-100 px-3 py-2">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </td>
                <td className="p-4">{order.total} Birr</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-100">
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => updateStatus(order.id, "TAKEN")}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg mr-2 hover:bg-green-700 transition-colors"
                  >
                    Taken
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "DECLINED")}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow rounded-xl overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Order No</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-sm">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="p-4 border-b">
              <p className="text-sm text-gray-500 mb-2">Items</p>
              {order.items.map((item) => (
                <div key={item.id} className="mb-2 rounded-lg bg-gray-100 px-3 py-2">
                  <p className="font-medium">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-b">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-semibold">{order.total} Birr</p>
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => updateStatus(order.id, "TAKEN")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1"
              >
                Taken
              </button>
              <button
                onClick={() => updateStatus(order.id, "DECLINED")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex-1"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  );
}