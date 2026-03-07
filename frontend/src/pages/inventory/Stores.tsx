import { useState } from "react";
import { Plus, MapPin, Store as StoreIcon, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore } from "@/services/dataService";
import api from "@/services/api";

export default function Stores() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await api.get("/stores");
      return res.data;
    },
    retry: 1,
  });

  const stores = storesResponse?.stores || [];

  const mutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setModal(false);
      setName("");
      setLocation("");
    },
  });

  const inputBase: React.CSSProperties = {
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
          <p className="data-label mb-1">Network</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Store Locations
          </h1>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold"
          style={{ background: "var(--accent-amber)", color: "#0a0b0d", fontFamily: "var(--font-display)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-amber-dim)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-amber)")}
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Store Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded animate-pulse"
              style={{ height: 160, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
            />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div
          className="panel flex flex-col items-center justify-center py-16 text-center"
          style={{ borderStyle: "dashed" }}
        >
          <StoreIcon className="w-10 h-10 mb-3 opacity-20" style={{ color: "var(--text-tertiary)" }} />
          <p className="text-sm" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            No stores configured. Add your first location.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store: any, i: number) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="kpi-card group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: "var(--accent-amber-glow)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <StoreIcon className="w-4 h-4" style={{ color: "var(--accent-amber)" }} />
                </div>
                <span
                  className="badge-live opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ fontSize: "0.55rem" }}
                >
                  active
                </span>
              </div>
              <h3
                className="font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "1rem" }}
              >
                {store.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                <MapPin className="w-3 h-3" />
                {store.location}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="panel-elevated w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="data-label mb-0.5">Network</p>
                  <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    Add Store Location
                  </h3>
                </div>
                <button onClick={() => setModal(false)} style={{ color: "var(--text-tertiary)" }}><X className="w-5 h-5" /></button>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate({ name, location });
                }}
              >
                <div>
                  <label className="data-label block mb-1.5">Store Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Downtown Main Branch"
                    required
                    style={inputBase}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-amber)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-amber-glow)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label className="data-label block mb-1.5">City / Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    required
                    style={inputBase}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-amber)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-amber-glow)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {mutation.isError && (
                  <div className="flex items-center gap-2 p-3 rounded text-xs" style={{ background: "var(--accent-rose-glow)", border: "1px solid rgba(251,113,133,0.2)", color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> Failed to create
                  </div>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm"
                  style={{ background: "var(--accent-amber)", color: "#0a0b0d", fontFamily: "var(--font-display)", opacity: mutation.isPending ? 0.6 : 1, cursor: mutation.isPending ? "not-allowed" : "pointer" }}
                >
                  {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : "Create Store"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
