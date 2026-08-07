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
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Menu", icon: UtensilsCrossed, path: "/admin/menu" },
  { title: "Categories", icon: Tags, path: "/admin/categories" },
  { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { title: "Sales", icon: BarChart3, path: "/admin/sales" },
  { title: "Customers", icon: Users, path: "/admin/customers" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Toggle Button (Visible only on mobile/tablet) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-md border text-gray-700 hover:bg-gray-50 focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-72 bg-white border-r shadow-sm flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-700">
            Terteb Admin
          </h1>

          {/* Close icon inside menu for small screens */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/admin"}
                onClick={closeSidebar} // Automatically closes menu on page click on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                    isActive
                      ? "bg-green-700 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={closeSidebar}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}