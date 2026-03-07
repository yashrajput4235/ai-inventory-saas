import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import Dashboard from "@/pages/dashboard/Dashboard";
import Inventory from "@/pages/inventory/Inventory";
import Reorder from "@/pages/forecast/Reorder";
import Alerts from "@/pages/alerts/Alerts";
import Products from "@/pages/inventory/Products";
import Stores from "@/pages/inventory/Stores";
import Sales from "@/pages/inventory/Sales";
import InviteUser from "@/pages/auth/InviteUser";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-otp", element: <VerifyOTP /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "inventory", element: <Inventory /> },
      { path: "products", element: <Products /> },
      { path: "stores", element: <Stores /> },
      { path: "sales", element: <Sales /> },
      { path: "reorder", element: <Reorder /> },
      { path: "alerts", element: <Alerts /> },
      { path: "invite-user", element: <InviteUser /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
