import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, AlertCircle, Loader2, X, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, createProduct, getStores } from "@/services/dataService";

const productSchema = z.object({
  name: z.string().min(2, "Required"),
  sku: z.string().min(2, "Required"),
  category: z.string().min(2, "Required"),
  price: z.preprocess((v) => Number(v), z.number().positive("Must be positive")),
  cost: z.preprocess((v) => Number(v), z.number().positive("Must be positive")),
  quantity: z.preprocess((v) => Number(v) || 0, z.number().min(0, "Cannot be negative").optional()),
  storeId: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 4,
  padding: "0.5rem 0.75rem",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-body)",
  outline: "none",
};

function FormInput({ label, error, ...props }: any) {
  return (
    <div>
      <label className="data-label block mb-1.5">{label}</label>
      <input
        {...props}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent-amber)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-amber-glow)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{error}</p>}
    </div>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Determine user role from localStorage
  const userRole = localStorage.getItem("userRole") || "manager";

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const products = productsData?.products || [];

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });
  
  const stores = storesData?.stores || [];

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalOpen(false);
      reset();
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = (useForm as any)({
    resolver: zodResolver(productSchema),
  }) as ReturnType<typeof useForm<ProductForm>>;

  const filtered = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

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
          <p className="data-label mb-1">Catalog</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Products
          </h1>
        </div>
        
        {/* Only Admin can create products */}
        {userRole === "admin" && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold transition-colors"
            style={{ background: "var(--accent-amber)", color: "#0a0b0d", fontFamily: "var(--font-display)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-amber-dim)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-amber)")}
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        )}
      </div>

      {/* Table Panel */}
      <div className="panel-elevated overflow-hidden">
        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, or category…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "var(--text-tertiary)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isError ? (
          <div className="flex items-center gap-3 p-6 text-sm" style={{ color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
            <AlertCircle className="w-4 h-4" />
            Backend unreachable — no products loaded
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: "1.5rem" }}>Product</th>
                <th style={{ textAlign: "left" }}>SKU</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[140, 80, 100, 60, 60, 50].map((w, j) => (
                      <td key={j}>
                        <div
                          className="rounded animate-pulse"
                          style={{ height: 12, width: w, marginLeft: j >= 3 ? "auto" : 0, background: "var(--bg-panel)" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--text-tertiary)" }} />
                    <p className="text-sm" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => {
                  const margin = item.price && item.cost
                    ? (((item.price - item.cost) / item.price) * 100).toFixed(1)
                    : null;
                  return (
                    <tr key={item.id}>
                      <td style={{ paddingLeft: "1.5rem", color: "var(--text-primary)", fontWeight: 500 }}>{item.name}</td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            color: "var(--text-tertiary)",
                            background: "var(--bg-panel)",
                            padding: "2px 6px",
                            borderRadius: 3,
                          }}
                        >
                          {item.sku}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "var(--accent-teal)",
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-mono)",
                            background: "var(--accent-teal-glow)",
                            border: "1px solid rgba(45,212,191,0.15)",
                            padding: "2px 8px",
                            borderRadius: 3,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        ${Number(item.cost || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                        ${Number(item.price || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "1.5rem", color: margin && parseFloat(margin) > 30 ? "var(--accent-teal)" : "var(--accent-amber)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                        {margin ? `${margin}%` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <div
          className="px-4 py-2.5 text-xs"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* New Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="panel-elevated w-full max-w-md p-6 relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="data-label mb-0.5">Catalog</p>
                  <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    Add New Product
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <FormInput label="Product Name" placeholder="Wireless Mouse" error={errors.name?.message} {...register("name")} />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="SKU" placeholder="WM-001" error={errors.sku?.message} {...register("sku")} />
                  <FormInput label="Category" placeholder="Electronics" error={errors.category?.message} {...register("category")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Selling Price ($)" type="number" step="0.01" placeholder="29.99" error={errors.price?.message} {...register("price")} />
                  <FormInput label="Unit Cost ($)" type="number" step="0.01" placeholder="12.50" error={errors.cost?.message} {...register("cost")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Initial Quantity" type="number" placeholder="0" error={errors.quantity?.message} {...register("quantity")} />
                  <div>
                    <label className="data-label block mb-1.5">Assign to Store</label>
                    <select
                      {...register("storeId")}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = "var(--accent-amber)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-amber-glow)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
                    >
                      <option value="">Default / First Store</option>
                      {stores.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {mutation.isError && (
                  <div className="flex items-center gap-2 p-3 rounded text-xs" style={{ background: "var(--accent-rose-glow)", border: "1px solid rgba(251,113,133,0.2)", color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Failed to create. Check your connection.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm"
                  style={{ background: "var(--accent-amber)", color: "#0a0b0d", fontFamily: "var(--font-display)", opacity: mutation.isPending ? 0.6 : 1, cursor: mutation.isPending ? "not-allowed" : "pointer" }}
                >
                  {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Product"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
