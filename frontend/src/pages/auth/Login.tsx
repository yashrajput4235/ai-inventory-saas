import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowRight, Mail, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/dataService";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

type LoginForm = z.infer<typeof loginSchema>;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 4,
  padding: "0.625rem 0.75rem 0.625rem 2.5rem",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-body)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function Login() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.role) localStorage.setItem("userRole", data.role);
      navigate("/dashboard");
    },
    onError: () => {},
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="data-label mb-2">Secure Login</p>
        <h2
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 700 }}
        >
          Welcome back
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Sign in to your organization dashboard
        </p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="data-label block mb-1.5"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                style={inputStyle}
                className="focus:border-amber-500"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="data-label" htmlFor="password">Password</label>
              <Link
                to="/auth/forgot-password"
                className="text-xs"
                style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                style={inputStyle}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>{errors.password.message}</p>
            )}
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded text-xs"
              style={{
                background: "var(--accent-rose-glow)",
                border: "1px solid rgba(251,113,133,0.2)",
                color: "var(--accent-rose)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Invalid credentials or server unreachable
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm transition-all mt-2"
            style={{
              background: loginMutation.isPending ? "rgba(245,158,11,0.5)" : "var(--accent-amber)",
              color: "#0a0b0d",
              fontFamily: "var(--font-display)",
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!loginMutation.isPending) {
                e.currentTarget.style.background = "var(--accent-amber-dim)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loginMutation.isPending) {
                e.currentTarget.style.background = "var(--accent-amber)";
              }
            }}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p
        className="text-center text-xs mt-6"
        style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        No organization?{" "}
        <Link
          to="/auth/register"
          style={{ color: "var(--accent-amber)" }}
        >
          Register here
        </Link>
      </p>
    </motion.div>
  );
}
