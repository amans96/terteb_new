import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";

export default function MenuGrid({ section, selectedCategory }) {
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States for Popups
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ==========================================
  // CATEGORY STYLING (Softer, Premium Colors)
  // ==========================================
  const categoryStyles = {
    'Appetizer': 'bg-blue-50 text-blue-700 border-blue-200',
    'Main Course': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Dessert': 'bg-pink-50 text-pink-700 border-pink-200',
    'Beverage': 'bg-purple-50 text-purple-700 border-purple-200',
    'Salad': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Soup': 'bg-orange-50 text-orange-700 border-orange-200',
    'Seafood': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Vegetarian': 'bg-green-50 text-green-700 border-green-200',
    'Breakfast': 'bg-amber-50 text-amber-700 border-amber-200',
    'Lunch': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Dinner': 'bg-red-50 text-red-700 border-red-200',
    'Snack': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    'Default': 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const getCategoryStyle = (category) => {
    const categoryName = typeof category === 'object' ? category?.name : category;
    return categoryStyles[categoryName] || categoryStyles['Default'];
  };

  const getCategoryName = (category) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Uncategorized';
    }
    return category || 'Uncategorized';
  };

  // ==========================================
  // FETCH DATA
  // ==========================================
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch(`${API_URL}/api/menu`);
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setFoods(data);
      } catch (error) {
        console.error(error);
        showToast("Failed to load menu items", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // ==========================================
  // CART LOGIC
  // ==========================================
  const addToCart = (food) => {
    const existing = cart.find((item) => item.id === food.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const decreaseQuantity = (id) => {
    const existing = cart.find((item) => item.id === id);
    if (existing.quantity === 1) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ==========================================
  // POPUP HELPERS
  // ==========================================
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================
  const placeOrder = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Add items to order.", "error");
      return;
    }

    const orderData = {
      tableNumber: 1, // Change later to user input
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
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to place order");

      // Show Success Modal & Empty Cart
      setShowSuccessModal(true);
      setCart([]);
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50/30">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading menu items...</p>
      </div>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 relative min-h-screen">
      
      {/* ==============================
          TOAST NOTIFICATION
      ============================== */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg border ${
            toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-900 border-gray-800 text-white"
          }`}>
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ==============================
          SUCCESS MODAL
      ============================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-8">
              Your order has been successfully sent to the kitchen.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              New Order
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ==============================
            LEFT: FOOD GRID
        ============================== */}
        <div className="flex-1 w-full">
          

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {foods.map((food) => {
              const style = getCategoryStyle(food.category);
              const categoryName = getCategoryName(food.category);

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md bg-opacity-90 ${style} shadow-sm`}>
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {food.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-1">
                      {food.description}
                    </p>

                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Price</p>
                        <span className="font-extrabold text-lg text-gray-900">
                          {Number(food.price).toLocaleString()} <span className="text-sm text-gray-500 font-medium">Birr</span>
                        </span>
                      </div>

                      <button
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
        </div>

        {/* ==============================
            RIGHT: STICKY CART
        ============================== */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px] lg:max-h-[calc(100vh-8rem)]">
            
            {/* Cart Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" />
                Current Order
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length > 0 ? (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Optional: Small Image Thumbnail if desired, omitting for clean list format */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {Number(item.price).toLocaleString()} Birr
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
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
                  <ShoppingCart size={48} className="mb-4 text-gray-200" strokeWidth={1.5} />
                  <p className="font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-sm">Add items to get started</p>
                </div>
              )}
            </div>

            {/* Cart Footer / Checkout */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {total.toLocaleString()} Birr
                </span>
              </div>

              <button
                onClick={placeOrder}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm
                  ${cart.length > 0 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                Place Order
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}