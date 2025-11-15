import Link from "next/link";
import { Plus, Eye, Download } from "lucide-react";

interface SidebarProps {
  onExport: () => void;
}

export default function Sidebar({ onExport }: SidebarProps) {
  return (
    <div className="w-full md:w-1/6 mt-5 mb-5 flex flex-col gap-5 items-start justify-start">
      <Link
        className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
        href="/new"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Event
      </Link>

      <Link
        className="flex items-center justify-center w-full h-12 border-2 border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 font-semibold rounded-lg"
        href="/events"
      >
        <Eye className="w-5 h-5 mr-2" />
        View your events
      </Link>

      <button
        onClick={onExport}
        className="flex items-center justify-center w-full h-12 border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 font-semibold rounded-lg"
      >
        <Download className="w-5 h-5 mr-2" />
        Export ICS
      </button>
    </div>
  );
}
