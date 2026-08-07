import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="bg-white shadow-sm border-b h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Search */}
      <div className="relative flex-1 sm:flex-initial sm:w-80 md:w-96">
        <Search
          size={18}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Notification */}
        <button className="relative p-1">
          <Bell
            size={22}
            className="text-gray-600 cursor-pointer sm:w-6 sm:h-6"
          />

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <UserCircle
            size={36}
            className="text-green-700 sm:w-10 sm:h-10 shrink-0"
          />

          {/* Hide user labels on mobile, show on tablet/desktop */}
          <div className="hidden sm:block">
            <p className="font-semibold text-sm sm:text-base leading-tight">
              Admin
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-tight">
              Restaurant Manager
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}