import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  RefreshCcw,
  Store,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Moon,
  Sun,
  Activity,
  UserPlus,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "@/services/dataService";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Operations",
    items: [
      { to: "/stores", label: "Stores", icon: Store },
      { to: "/products", label: "Products", icon: Package },
      { to: "/inventory", label: "Inventory", icon: BarChart3 },
      { to: "/sales", label: "Sales POS", icon: ShoppingCart },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { to: "/alerts", label: "Stock Alerts", icon: AlertTriangle },
      { to: "/reorder", label: "Smart Reorder", icon: RefreshCcw },
      // { to: "/forecast", label: "AI Forecast", icon: TrendingUp }, // Temporarily disabled until page is built
    ]
  },
  {
    label: "Team",
    items: [
      { to: "/invite-user", label: "Invite Member", icon: UserPlus },
    ]
  }
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      localStorage.removeItem("userRole");
      navigate("/auth/login");
    },
    onError: () => navigate("/auth/login"),
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("light-mode");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ─── Sidebar ─── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-shrink-0 relative overflow-hidden border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Grid texture */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 border-b"
          style={{
            height: 56,
            borderColor: "var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded"
            style={{ background: "var(--accent-amber)" }}
          >
            <Activity className="w-4 h-4" style={{ color: "#0a0b0d" }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-display font-bold text-sm tracking-wide truncate"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
              >
                InventoryAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 relative z-10">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="data-label px-3 mb-1"
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.12 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Controls */}
        <div
          className="border-t py-3 px-2 space-y-0.5 relative z-10"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={toggleTheme}
            className="sidebar-link w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="sidebar-link w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start", color: "var(--accent-rose)" }}
            title="Log out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[68px] w-6 h-6 rounded-full flex items-center justify-center z-20 transition-colors"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-amber)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* ─── Main ─── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 flex-shrink-0"
          style={{
            height: 56,
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="badge-live">live</span>
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
            >
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded flex items-center justify-center transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Bell className="w-4 h-4" />
            </button>
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--accent-amber)",
                color: "#0a0b0d",
                fontFamily: "var(--font-display)",
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: "var(--bg-base)" }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
