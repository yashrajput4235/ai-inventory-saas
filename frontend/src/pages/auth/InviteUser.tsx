import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import { registerUser, verifyOtp, resendOtp } from "@/services/dataService";

// ─── Schemas ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name:     z.string().min(2, "Name is required"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type OtpForm     = z.infer<typeof otpSchema>;

// ─── Shared input style ────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 4,
  padding: "0.625rem 0.75rem 0.625rem 2.5rem",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-body)",
  outline: "none",
};

function Field({ icon: Icon, label, error, children }: {
  icon: any; label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="data-label block mb-1.5">{label}</label>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-tertiary)" }}
        />
        {children}
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function InviteUser() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "otp" | "done">("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resent, setResent] = useState(false);

  // ── Register mutation ──
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (_, variables: RegisterForm) => {
      setRegisteredEmail(variables.email);
      setStep("otp");
    },
  });

  // ── OTP verify mutation ──
  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => setStep("done"),
  });

  // ── Resend OTP ──
  const resendMutation = useMutation({
    mutationFn: () => resendOtp({ email: registeredEmail }),
    onSuccess: () => {
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    },
  });

  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const otpForm      = useForm<OtpForm>     ({ resolver: zodResolver(otpSchema) });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="data-label mb-2">Team Management</p>
        <h2
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 700 }}
        >
          {step === "register" && "Add Team Member"}
          {step === "otp"      && "Verify Email"}
          {step === "done"     && "Account Ready"}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {step === "register" && "Register a new employee to this organization."}
          {step === "otp"      && `Enter the 6-digit OTP sent to ${registeredEmail}`}
          {step === "done"     && "The user can now log in with their credentials."}
        </p>
      </div>

      {/* ── Step 1: Registration form ── */}
      <AnimatePresence mode="wait">
        {step === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
            className="auth-card"
          >
            <form
              onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}
              className="space-y-4"
            >
              {/* Name */}
              <Field icon={User} label="Full Name" error={registerForm.formState.errors.name?.message}>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  style={inputBase}
                  {...registerForm.register("name")}
                />
              </Field>

              {/* Email */}
              <Field icon={Mail} label="Work Email" error={registerForm.formState.errors.email?.message}>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  style={inputBase}
                  {...registerForm.register("email")}
                />
              </Field>

              {/* Password */}
              <Field icon={Lock} label="Temporary Password" error={registerForm.formState.errors.password?.message}>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={inputBase}
                  {...registerForm.register("password")}
                />
              </Field>

              {/* Error */}
              {registerMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded text-xs"
                  style={{ background: "var(--accent-rose-glow)", border: "1px solid rgba(251,113,133,0.2)", color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {(registerMutation.error as any)?.response?.data?.message || "Registration failed. Email may already be in use."}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm mt-2"
                style={{
                  background: registerMutation.isPending ? "rgba(245,158,11,0.5)" : "var(--accent-amber)",
                  color: "#0a0b0d",
                  fontFamily: "var(--font-display)",
                  cursor: registerMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Send Invite</>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Step 2: OTP form ── */}
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="auth-card"
          >
            <form
              onSubmit={otpForm.handleSubmit((d) =>
                verifyMutation.mutate({ email: registeredEmail, otp: d.otp })
              )}
              className="space-y-4"
            >
              <Field icon={Mail} label="One-Time Password" error={otpForm.formState.errors.otp?.message}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  style={{ ...inputBase, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textAlign: "center" }}
                  {...otpForm.register("otp")}
                />
              </Field>

              {verifyMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded text-xs"
                  style={{ background: "var(--accent-rose-glow)", border: "1px solid rgba(251,113,133,0.2)", color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Invalid or expired OTP. Try resending.
                </motion.div>
              )}

              {resent && (
                <p className="text-xs text-center" style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
                  ✓ OTP resent to {registeredEmail}
                </p>
              )}

              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm"
                style={{
                  background: verifyMutation.isPending ? "rgba(245,158,11,0.5)" : "var(--accent-amber)",
                  color: "#0a0b0d",
                  fontFamily: "var(--font-display)",
                  cursor: verifyMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {verifyMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <>Verify OTP <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="w-full text-xs py-2"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                {resendMutation.isPending ? "Sending…" : "Didn't receive it? Resend OTP"}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Step 3: Success ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="auth-card text-center"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--accent-teal-glow)", border: "1px solid rgba(45,212,191,0.3)" }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: "var(--accent-teal)" }} />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              User Created!
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
                {registeredEmail}
              </span>{" "}
              has been added to your organization and can now log in.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep("register"); registerForm.reset(); otpForm.reset(); }}
                className="flex-1 py-2.5 rounded text-sm font-semibold"
                style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)", background: "transparent", fontFamily: "var(--font-display)", cursor: "pointer" }}
              >
                Add Another
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-semibold"
                style={{ background: "var(--accent-amber)", color: "#0a0b0d", fontFamily: "var(--font-display)", cursor: "pointer" }}
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
