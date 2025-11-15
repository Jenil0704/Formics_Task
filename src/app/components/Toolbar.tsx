import Link from "next/link";
import { Download, Plus } from "lucide-react";

interface ToolbarProps {
  onExport: () => void;
}

export default function Toolbar({ onExport }: ToolbarProps) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Events</h2>
        <p className="mt-1 text-sm sm:text-base text-slate-600">Manage and organize your schedule</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-95 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Export ICS
        </button>
        <Link
          href="/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>
    </div>
  );
}
