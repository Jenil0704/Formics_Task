"use client";

import { useState } from "react";
import Calendar from "./components/Calendar";
import AuthHeader from "../components/AuthHeader";
import Sidebar from "./hooks/Sidebar";
import Loading from "./components/Loading";
import useAuthRedirect from "./hooks/useAuthRedirect";
import useExportEvents from "./hooks/useExportEvents";

export default function Home() {
  const { session, status } = useAuthRedirect();
  const exportEvents = useExportEvents();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (status === "loading") return <Loading />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="mt-5 px-2 flex flex-col md:flex-row gap-3">
        {/* Calendar */}
        <div className="w-full md:w-5/6 h-full">
          <Calendar refreshTrigger={refreshTrigger} />
        </div>

        {/* Sidebar */}
        <Sidebar onExport={exportEvents} />
      </div>
    </div>
  );
}
