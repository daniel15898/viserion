import React from "react";
import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/router/routerConfig";

function ProtectedLayout() {
  // TODO: Replace with your actual authentication logic
  const isAuthenticated = true; // This should come from your auth context/state
  const isLoading = false; // Loading state for auth check

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render the protected layout
  return <Outlet />;
}

export default ProtectedLayout;
