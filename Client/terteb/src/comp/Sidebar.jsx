import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  MoreVertical
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Menu", icon: UtensilsCrossed, path: "/admin/menu" },
  { title: "Categories", icon: Tags, path: "/admin/categories" },
  { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { title: "Sales", icon: BarChart3, path: "/admin/sales" },

];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* ==============================
          MOBILE TOGGLE BUTTON
      ============================== */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ==============================
          MOBILE BACKDROP
      ============================== */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-gray-900/40 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ==============================
          SIDEBAR CONTAINER
      ============================== */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRAND / LOGO */}
        <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <Store className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Terteb <span className="text-emerald-600">Admin</span>
            </h1>
          </div>

          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Main Menu
          </p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/admin"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={20} 
                      className={`transition-colors duration-200 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} 
                    />
                    <span>{item.title}</span>
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ==============================
            USER PROFILE & LOGOUT
        ============================== */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          
          {/* User Profile Snippet */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
              <span className="font-bold text-emerald-700 text-sm">TA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Terteb Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@terteb.com</p>
            </div>
            <MoreVertical size={18} className="text-gray-400" />
          </div>

          {/* Logout Button */}
          <button
            onClick={closeSidebar}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 transition-colors group"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}