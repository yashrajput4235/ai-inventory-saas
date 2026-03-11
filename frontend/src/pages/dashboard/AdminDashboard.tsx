import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, Package, ShoppingCart, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";
import { getOrgSummary, getOrgTopProducts, getOrgDashboardPredictions } from "@/services/dataService";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function KpiCard({ title, value, icon: Icon, loading, suffix = "", trend }: any) {
  return (
    <motion.div variants={itemVariants} className="kpi-card">
      <div className="flex items-start justify-between mb-4">
        <div className="data-label">{title}</div>
        <div
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: "var(--accent-amber)" }} />
        </div>
      </div>
      {loading ? (
        <div
          className="h-8 w-32 rounded animate-pulse"
          style={{ background: "var(--bg-elevated)" }}
        />
      ) : (
        <div className="flex items-end justify-between">
          <div
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.03em" }}
          >
            {value}{suffix}
          </div>
          {trend && (
            <div
              className="flex items-center gap-1 text-xs"
              style={{
                color: trend === "up" ? "var(--accent-teal)" : "var(--accent-rose)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              live
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

const customTooltipStyle = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border-default)",
  borderRadius: 4,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--text-primary)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

const COLORS = ['#f59e0b', '#2dd4bf', '#a855f7', '#ec4899', '#3b82f6'];

export default function AdminDashboard() {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ["orgSummary"],
    queryFn: getOrgSummary,
    retry: 1,
  });

  const { data: topProducts, isLoading: isTopProdLoading } = useQuery({
    queryKey: ["orgTopProducts"],
    queryFn: getOrgTopProducts,
    retry: 1,
  });

  const { data: aiDashboard, isLoading: isAiLoading } = useQuery({
    queryKey: ["orgAiDashboard"],
    queryFn: getOrgDashboardPredictions,
    retry: 1,
  });

  const aiData = aiDashboard?.dashboard?.slice(0, 12) || [];
  const topProds = Array.isArray(topProducts) ? topProducts.slice(0, 6) : [];
  const storesRevenue = aiDashboard?.storesRevenue || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="data-label mb-1">HQ Command Center</p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Organization Dashboard
          </h1>
        </div>
        <div className="badge-live">Live data</div>
      </div>

      {isSummaryError && (
        <div
          className="flex items-center gap-3 p-4 rounded text-sm"
          style={{
            background: "var(--accent-rose-glow)",
            border: "1px solid rgba(251,113,133,0.2)",
            color: "var(--accent-rose)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Backend unreachable — is the API server running?
        </div>
      )}

      {/* KPI Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <KpiCard
          title="Total Org Revenue"
          value={summary ? `$${Number(summary.totalRevenue || 0).toLocaleString()}` : "$—"}
          icon={DollarSign}
          loading={isSummaryLoading}
          trend="up"
        />
        <KpiCard
          title="Total Org Profit"
          value={summary ? `$${Number(summary.totalProfit || 0).toLocaleString()}` : "$—"}
          icon={TrendingUp}
          loading={isSummaryLoading}
          trend="up"
        />
        <KpiCard
          title="Total Org Sales"
          value={summary ? String(summary.totalSales ?? 0) : "—"}
          icon={ShoppingCart}
          loading={isSummaryLoading}
        />
        <KpiCard
          title="Total Active SKUs"
          value={isAiLoading ? "—" : String(aiDashboard?.dashboard?.length || 0)}
          icon={Activity}
          loading={isAiLoading}
          trend={aiDashboard?.dashboard?.length ? "up" : null}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* AI Demand Forecast */}
        <motion.div
          className="panel-elevated col-span-1 lg:col-span-4 p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="data-label mb-0.5">AI Engine (Organization Wide)</p>
              <h3
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Global Demand Overview
              </h3>
            </div>
            <span className="badge-live">vertex ai</span>
          </div>

          {isAiLoading ? (
            <div
              className="h-64 w-full rounded animate-pulse"
              style={{ background: "var(--bg-panel)" }}
            />
          ) : !aiData.length ? (
            <div
              className="h-64 flex items-center justify-center text-sm"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              — No active forecast data —
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={aiData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="demandGradOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stockGradOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="series_id"
                  stroke="transparent"
                  tick={{ fill: "var(--text-tertiary)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                  tickFormatter={(v) => v.slice(0, 6)}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "var(--text-tertiary)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                />
                <RechartsTooltip contentStyle={customTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="predicted_demand"
                  name="Predicted Demand"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#demandGradOrg)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b", stroke: "var(--bg-panel)", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="current_stock"
                  name="Current Stock"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fill="url(#stockGradOrg)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#2dd4bf", stroke: "var(--bg-panel)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div
            className="flex items-center gap-4 mt-3 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 inline-block rounded" style={{ background: "#f59e0b" }} />
              Predicted Demand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 inline-block rounded" style={{ background: "#2dd4bf" }} />
              Current Stock
            </span>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          className="panel-elevated col-span-1 lg:col-span-3 p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
        >
          <div className="mb-5">
            <p className="data-label mb-0.5">Global Performance</p>
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Top Products by Revenue
            </h3>
          </div>

          {isTopProdLoading ? (
            <div
              className="h-64 w-full rounded animate-pulse"
              style={{ background: "var(--bg-panel)" }}
            />
          ) : !topProds.length ? (
            <div
              className="h-64 flex items-center justify-center text-sm"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              — No sales data yet —
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProds} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="transparent"
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  width={80}
                  tickFormatter={(v) => (v.length > 10 ? v.slice(0, 10) + "…" : v)}
                />
                <RechartsTooltip contentStyle={customTooltipStyle} />
                <Bar
                  dataKey="totalRevenue"
                  name="Revenue"
                  fill="#f59e0b"
                  radius={[0, 3, 3, 0]}
                  opacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Value strip */}
        {summary?.inventoryValue != null && (
          <motion.div
            className="panel panel-amber-border p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="data-label mb-1">Global Inventory Valuation</p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--accent-amber)", letterSpacing: "-0.03em" }}
                  >
                    ${(summary.inventoryValue).toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                    total stock value across all stores
                  </span>
                </div>
              </div>
              <Package className="w-10 h-10 opacity-20" style={{ color: "var(--accent-amber)" }} />
            </div>
          </motion.div>
        )}

        {/* Revenue By Store */}
        {storesRevenue.length > 0 && (
          <motion.div
            className="panel-elevated p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="data-label mb-0.5">Revenue Breakdown</p>
                <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  Sales by Store
                </h3>
              </div>
            </div>
            {isAiLoading ? (
            <div className="h-64 w-full rounded animate-pulse" style={{ background: "var(--bg-panel)" }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <RechartsTooltip contentStyle={customTooltipStyle} />
                  <Pie
                    data={storesRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="revenue"
                    nameKey="storeName"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
                        const RADIAN = Math.PI / 180;
                        const angle = midAngle || 0;
                        const radius = 25 + innerRadius + (outerRadius - innerRadius);
                        const x = cx + radius * Math.cos(-angle * RADIAN);
                        const y = cy + radius * Math.sin(-angle * RADIAN);
                        return (
                          <text 
                            x={x} y={y} fill="var(--text-tertiary)" className="text-xs" 
                            textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" 
                            style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                            {storesRevenue[index].storeName.slice(0, 10)} (${value.toLocaleString()})
                          </text>
                        );
                    }}
                  >
                    {storesRevenue.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
