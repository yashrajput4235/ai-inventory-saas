import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Cpu } from "lucide-react";

const STATS = [
  { label: "Products tracked", value: "24,891" },
  { label: "Stores connected", value: "147" },
  { label: "Orders processed", value: "1.2M" },
  { label: "AI accuracy", value: "97.4%" },
];

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Left panel — branding/info */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden p-12"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="scanline-overlay" />

        {/* Ambient glow */}
        <div
          className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-9 h-9 rounded flex items-center justify-center"
              style={{ background: "var(--accent-amber)" }}
            >
              <Activity className="w-5 h-5" style={{ color: "#0a0b0d" }} />
            </div>
            <span
              className="text-lg font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              InventoryAI
            </span>
          </div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Inventory intelligence,{" "}
              <span style={{ color: "var(--accent-amber)" }} className="text-glow-amber">
                at scale.
              </span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              AI-powered demand forecasting, live inventory tracking, and automated reorder recommendations — all in one platform.
            </p>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="panel p-4"
              >
                <div className="data-value text-2xl">{stat.value}</div>
                <div className="data-label mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div
            className="flex items-center gap-2 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
          >
            <Cpu className="w-3 h-3" />
            <span>Powered by Google Vertex AI + BigQuery</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Noise overlay */}
        <div className="noise-overlay" />

        {/* Corner decoration */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(45,212,191,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: "var(--accent-amber)" }}
            >
              <Activity className="w-4 h-4" style={{ color: "#0a0b0d" }} />
            </div>
            <span
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}
            >
              InventoryAI
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
