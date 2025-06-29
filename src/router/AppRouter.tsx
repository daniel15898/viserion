import LoginPage from "@/pages/LoginPage";
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { ROUTES } from "./routerConfig";
import TransmitPage from "@/pages/TransmitPage";
import SamplePage from "@/pages/SamplePage";
import NotFoundPage from "@/pages/NotFoundPage";
import SampleTablePage from "@/pages/SampleTablePage";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import AppLayout from "@/layouts/AppLauout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected Routes with index route */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to={ROUTES.LOGIN} replace />} />

          <Route element={<AppLayout />}>
            <Route path={ROUTES.TRANSMIT} element={<TransmitPage />} />
            <Route path={ROUTES.SAMPLE} element={<SamplePage />} />
            <Route path={ROUTES.SAMPLE_TABLE} element={<SampleTablePage />} />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
