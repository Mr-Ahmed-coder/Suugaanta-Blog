import React from "react";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "../../components/common/ProtectedRoute";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";

function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={["admin", "editor"]}>
      <div className="flex min-h-screen bg-brand-cream text-brand-green-950 font-sans">
        {/* Sidebar Panel */}
        <DashboardSidebar />

        {/* Core CMS Container */}
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {/* Header Panel */}
          <DashboardHeader />

          {/* Render Area */}
          <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayout;
