import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Waiter() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error("Please log in to view orders.");
            }

            const response = await fetch(`${API_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load orders.");
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const approveOrder = async (orderId) => {
        setApprovingId(orderId);
        setError("");
        setSuccess("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "TAKEN" }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to approve order.");
            }

            setSuccess(
                `Order ${data.order?.orderNumber || orderId} approved successfully.`
            );

            await loadOrders();
        } catch (err) {
            setError(err.message || "Failed to approve order.");
        } finally {
            setApprovingId(null);
        }
    };

    const formatMoney = (amount) =>
        Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <p className="text-gray-600">Loading orders...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Waiter Orders
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View incoming orders and approve pending orders.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadOrders}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
                    >
                        Refresh orders
                    </button>
                </header>

                {error && (
                    <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <div className="mb-4 text-sm text-gray-600">
                    Total orders: {orders.length}
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <h2 className="font-semibold text-gray-800">No orders found</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Orders will appear here when customers place them.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const pending = order.status === "PENDING";
                            const approving = approvingId === order.id;

                            return (
                                <article
                                    key={order.id}
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {order.orderNumber || `Order ${order.id}`}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {order.isTakeaway
                                                    ? "Takeaway"
                                                    : `Table ${order.tableNumber || "N/A"}`}
                                            </p>

                                            {order.customerName && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Customer: {order.customerName}
                                                </p>
                                            )}

                                            {order.createdAt && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="my-4 border-t border-gray-100" />

                                    <h3 className="mb-2 text-sm font-semibold text-gray-800">
                                        Order items
                                    </h3>

                                    <div className="space-y-2">
                                        {(order.items || []).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between gap-3 text-sm"
                                            >
                                                <span className="text-gray-700">
                                                    {item.menuItem?.name || "Menu item"} × {item.quantity}
                                                </span>
                                                <span className="text-gray-600">
                                                    {formatMoney(
                                                        item.subtotal ??
                                                        Number(item.price) * Number(item.quantity)
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.notes && (
                                        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                                            <strong>Notes:</strong> {order.notes}
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Order total</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatMoney(order.total)}
                                            </p>
                                        </div>

                                        {pending ? (
                                            <button
                                                type="button"
                                                onClick={() => approveOrder(order.id)}
                                                disabled={approving}
                                                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {approving ? "Approving..." : "Approve Order"}
                                            </button>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                {order.status === "TAKEN"
                                                    ? "Order approved"
                                                    : "No approval action available"}
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Waiter;