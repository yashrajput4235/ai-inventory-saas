import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
  const userRole = localStorage.getItem("userRole");

  // Admin gets the global view
  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  // Managers get the store-specific view
  return <ManagerDashboard />;
}
