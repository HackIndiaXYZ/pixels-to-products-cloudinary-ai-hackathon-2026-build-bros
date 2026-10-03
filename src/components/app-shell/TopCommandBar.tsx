import Link from "next/link";
import { Bell, FilePlus } from "lucide-react";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

export function TopCommandBar() {
  return (
    <div className="flex-shrink-0 sticky top-0 z-10 bg-transparent mb-2">
      <div className="h-[80px] px-8 max-w-[1600px] mx-auto w-full flex items-center justify-between">
        <GlobalSearch />

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/analysis/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-[12px] font-ui font-medium text-xs shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:border-gray-300 transition-all hover:-translate-y-[1px] active:scale-[0.98]"
          >
            <FilePlus className="w-3.5 h-3.5" />
            New Analysis
          </Link>
          
          <div className="w-px h-4 bg-gray-200 mx-1"></div>

          <button className="w-9 h-9 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] active:scale-[0.98]">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center text-white font-editorial text-sm shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
            RR
          </div>
        </div>
      </div>
    </div>
  );
}
