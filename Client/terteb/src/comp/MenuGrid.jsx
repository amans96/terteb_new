import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function MenuGrid({ section, selectedCategory }) {
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  useEffect(() => {
    if (!toast.show) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const categoryStyles = {
    Appetizer: "bg-blue-50 text-blue-700 border-blue-200",
    "Main Course": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Dessert: "bg-pink-50 text-pink-700 border-pink-200",
    Beverage: "bg-purple-50 text-purple-700 border-purple-200",
    Salad: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Soup: "bg-orange-50 text-orange-700 border-orange-200",
    Seafood: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Vegetarian: "bg-green-50 text-green-700 border-green-200",
    Breakfast: "bg-amber-50 text-amber-700 border-amber-200",
    Lunch: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Dinner: "bg-red-50 text-red-700 border-red-200",
    Snack: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    Default: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const getCategoryName = (category) => {
    if (category && typeof category === "object") {
      return category.name ?? category.title ?? "";
    }
    return category ?? "";
  };

  const getCategoryStyle = (category) => {
    const categoryName = getCategoryName(category);
    return (
      categoryStyles[categoryName] ||
      categoryStyles[
      Object.keys(categoryStyles).find(
        (key) => normalize(key) === normalize(categoryName)
      )
      ] ||
      categoryStyles.Default
    );
  };

  const filteredFoods = useMemo(() => {
    const activeCategory = normalize(selectedCategory);
    const activeSection = normalize(section);

    return foods.filter((food) => {
      // Keep unavailable menu items hidden, unless the API does not provide
      // an "available" field at all.
      if (food.available === false) return false;

      const foodSection = normalize(
        food.section?.name ??
        food.section ??
        food.mealSection ??
        food.category?.section ??
        ""
      );

      const matchesCategory =
        !activeCategory ||
        activeCategory === "all" ||
        categoryName === activeCategory;

      const matchesSection =
        !activeSection ||
        activeSection === "all" ||
        foodSection === activeSection ||
        categoryName === activeSection;

      return matchesCategory && matchesSection;
    });
  }, [foods, selectedCategory, section]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFoods = async () => {
      setLoading(true);

      try {
        const endpoint = API_URL
          ? `${API_URL}/menu`
          : "/api/menu";
        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch menu (${response.status})`);
        }

        const data = await response.json();
        const menuItems = Array.isArray(data)
          ? data
          : Array.isArray(data.menu)
            ? data.menu
            : Array.isArray(data.items)
              ? data.items
              : [];

        setFoods(menuItems);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load menu:", error);
          showToast("Failed to load menu items. Please try again.", "error");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFoods();

    return () => controller.abort();
  }, [showToast]);

  const addToCart = (food) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === food.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) => {
      const item = currentCart.find((cartItem) => cartItem.id === id);
      if (!item) return currentCart;

      if (item.quantity <= 1) {
        return currentCart.filter((cartItem) => cartItem.id !== id);
      }

      return currentCart.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Add items to order.", "error");
      return;
    }

    const orderData = {
      tableNumber: 1,
      customerName: "Guest",
      customerPhone: "",
      isTakeaway: false,
      notes: "",
      items: cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const endpoint = API_URL
        ? `${API_URL}/orders`
        : "/api/orders";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setShowSuccessModal(true);
      setCart([]);
    } catch (error) {
      console.error("Failed to place order:", error);
      showToast(error.message || "Failed to place order", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50/30">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading menu items...
        </p>
      </div>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 relative min-h-screen">
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg border ${toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-gray-900 border-gray-800 text-white"
              }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              aria-label="Close success message"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h2>
            <p className="text-gray-500 mb-8">
              Your order has been successfully sent to the kitchen.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              New Order
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full">
          {filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFoods.map((food) => {
                const style = getCategoryStyle(food.category);
                const categoryName =
                  getCategoryName(food.category) || "Uncategorized";

                return (
                  <div
                    key={food.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={food.image || "/placeholder-food.png"}
                        alt={food.name || "Menu item"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md bg-opacity-90 ${style} shadow-sm`}
                        >
                          {categoryName}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {food.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-1">
                        {food.description}
                      </p>

                      <div className="mt-6 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">
                            Price
                          </p>
                          <span className="font-extrabold text-lg text-gray-900">
                            {Number(food.price || 0).toLocaleString()}{" "}
                            <span className="text-sm text-gray-500 font-medium">
                              Birr
                            </span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(food)}
                          className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                          <Plus size={18} />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-64 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <ShoppingCart size={42} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">
                No menu items found
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Try selecting another category or section.
              </p>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[400px] shrink-0 sticky top-24">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px] lg:max-h-[calc(100vh-8rem)]">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" />
                Current Order
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length > 0 ? (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {Number(item.price || 0).toLocaleString()} Birr
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            aria-label={`Increase ${item.name} quantity`}
                            className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <ShoppingCart
                    size={48}
                    className="mb-4 text-gray-200"
                    strokeWidth={1.5}
                  />
                  <p className="font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-sm">Add items to get started</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {total.toLocaleString()} Birr
                </span>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${cart.length > 0
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Place Order
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
