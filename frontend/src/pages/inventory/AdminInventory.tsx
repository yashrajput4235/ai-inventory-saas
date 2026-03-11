import { useState } from "react";
import { Search, X, Package, AlertCircle, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getOrgInventory, getStores } from "@/services/dataService";

function StatusBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const isLow = stock <= threshold;
  const isCritical = stock <= threshold * 0.5;

  if (isCritical) return (
    <span className="badge-alert">CRITICAL</span>
  );
  if (isLow) return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase" as const,
      color: "var(--accent-amber)", background: "var(--accent-amber-glow)",
      border: "1px solid rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: 2,
    }}>LOW</span>
  );
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase" as const,
      color: "var(--accent-teal)", background: "var(--accent-teal-glow)",
      border: "1px solid rgba(45,212,191,0.15)", padding: "2px 8px", borderRadius: 2,
    }}>OK</span>
  );
}

export default function AdminInventory() {
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("ALL");

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });
  
  const stores = storesData?.stores || [];

  const { data: inventoryResponse, isLoading, isError } = useQuery({
    queryKey: ["orgInventory"],
    queryFn: getOrgInventory,
  });

  const allItems = inventoryResponse?.inventory || [];
  
  // Filter by Store Dropdown
  const storeFilteredItems = selectedStore === "ALL" 
    ? allItems 
    : allItems.filter((i: any) => i.storeId === selectedStore);

  // Filter by Search Query
  const filtered = storeFilteredItems.filter((item: any) =>
    item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
    item.store?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = filtered.filter((i: any) => i.quantity <= i.lowStockThreshold * 0.5).length;
  const lowCount = filtered.filter((i: any) => i.quantity <= i.lowStockThreshold && i.quantity > i.lowStockThreshold * 0.5).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="data-label mb-1">Organization Stock Levels</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Global Inventory
            </h1>
          </div>
        </div>
        {/* Quick stat pills */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <span className="badge-alert">{criticalCount} critical</span>}
          {lowCount > 0 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: "var(--accent-amber)", background: "var(--accent-amber-glow)",
              border: "1px solid rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: 2,
            }}>{lowCount} low</span>
          )}
        </div>
      </div>

      {isError ? (
        <div className="panel p-6 flex items-center gap-3 text-sm" style={{ color: "var(--accent-rose)", fontFamily: "var(--font-mono)", borderColor: "rgba(251,113,133,0.2)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Backend unreachable — inventory data unavailable
        </div>
      ) : (
        <div className="panel-elevated overflow-hidden">
          {/* Controls Bar: Search & Store Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            
            {/* Search */}
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product, SKU, or store..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "0.875rem", fontFamily: "var(--font-body)" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ color: "var(--text-tertiary)" }}><X className="w-3.5 h-3.5" /></button>}
            </div>

            {/* Store Filter Dropdown */}
            <div className="flex items-center gap-2 sm:border-l sm:pl-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <Building2 className="w-4 h-4 text-gray-500" style={{ color: "var(--text-tertiary)" }} />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-sm bg-transparent border-none outline-none cursor-pointer"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
              >
                <option value="ALL">All Stores</option>
                {stores.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full data-table min-w-[800px]">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingLeft: "1.5rem" }}>Product</th>
                  <th style={{ textAlign: "left" }}>SKU</th>
                  <th style={{ textAlign: "left" }}>Store</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Threshold</th>
                  <th style={{ textAlign: "center", paddingRight: "1.5rem" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {[140, 80, 100, 60, 40, 60, 70].map((w, j) => (
                        <td key={j} style={{ padding: "0.875rem 1rem" }}>
                          <div className="rounded animate-pulse" style={{ height: 12, width: w, marginLeft: j >= 3 && j <=5 ? "auto" : 0, background: "var(--bg-panel)" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--text-tertiary)" }} />
                      <p className="text-sm" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>No inventory items found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ paddingLeft: "1.5rem", color: "var(--text-primary)", fontWeight: 500 }}>{item.product?.name}</td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-tertiary)", background: "var(--bg-panel)", padding: "2px 6px", borderRadius: 3 }}>
                          {item.product?.sku}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {item.store?.name}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        ${Number(item.product?.price || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: item.quantity <= item.lowStockThreshold ? "var(--accent-rose)" : "var(--text-primary)" }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                        {item.lowStockThreshold}
                      </td>
                      <td style={{ textAlign: "center", paddingRight: "1.5rem" }}>
                        <StatusBadge stock={item.quantity} threshold={item.lowStockThreshold} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 text-xs" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </motion.div>
  );
}
