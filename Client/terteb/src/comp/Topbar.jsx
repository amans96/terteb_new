import {
  Bell,
  Search,
  ChevronDown
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4 transition-all">
      
      {/* ==============================
          SEARCH BAR
      ============================== */}
      <div className="relative flex-1 sm:flex-initial sm:w-80 md:w-96 group">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-12 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100/70 border-transparent rounded-xl outline-none hover:bg-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
        />
        
        {/* Keyboard shortcut hint (Hidden on mobile) */}
        <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md absolute right-2.5 top-1/2 -translate-y-1/2 shadow-sm pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* ==============================
          RIGHT SIDE ACTIONS
      ============================== */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* NOTIFICATION BELL */}
        <button className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <Bell size={20} className="sm:w-5 sm:h-5" />

          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>

        {/* ==============================
            USER PROFILE PILL
        ============================== */}
        <button className="flex items-center gap-3 p-1 sm:pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-left group">
          
          {/* Avatar Graphic */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <span className="font-bold text-emerald-700 text-xs sm:text-sm">TA</span>
          </div>

          {/* Text Labels (Hidden on mobile) */}
          <div className="hidden sm:block">
            <p className="font-bold text-sm text-gray-900 leading-tight">
              Admin
            </p>
            <p className="text-[11px] font-medium text-gray-500 leading-tight mt-0.5">
              Store Manager
            </p>
          </div>

          {/* Dropdown Indicator */}
          <ChevronDown size={16} className="text-gray-400 hidden sm:block group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </header>
  );
}