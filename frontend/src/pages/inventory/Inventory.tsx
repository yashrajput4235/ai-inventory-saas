import AdminInventory from "./AdminInventory";
import ManagerInventory from "./ManagerInventory";

export default function Inventory() {
  const userRole = localStorage.getItem("userRole");

  // Admin gets the global view
  if (userRole === "admin") {
    return <AdminInventory />;
  }

  // Managers get the store-specific view
  return <ManagerInventory />;
}
