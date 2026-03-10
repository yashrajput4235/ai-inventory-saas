import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, KeyRound, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp } from "@/services/dataService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = location.state?.email || "your email";

  useEffect(() => {
    if (!location.state?.email) {
      // If accessed directly without an email in state, redirect back to register
      navigate("/auth/register");
    }
  }, [location, navigate]);

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data?.role) localStorage.setItem("userRole", data.role);
      // Automatically login or direct to dashboard depending on token setup
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("OTP Verification failed", error);
    }
  });

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      alert("New OTP sent to your email.");
    }
  });

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value.length > 1 || !/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Auto focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    
    verifyMutation.mutate({ email, otp: otpString });
  };

  const isComplete = otp.every(digit => digit !== "");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-2xl border-gray-100 dark:border-zinc-800 backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 w-full max-w-md mx-auto">
        <CardHeader className="space-y-4 pb-4">
          <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
             <KeyRound className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Verify your email
          </CardTitle>
          <CardDescription className="text-center px-4">
            We sent a 6-digit code to <br/>
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {verifyMutation.isError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2 font-medium justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Invalid or expired code. Please try again.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg"
              disabled={!isComplete || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-gray-100 dark:border-zinc-800 pt-6 text-center space-y-4">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Didn't receive the code?{" "}
            <button
              onClick={() => resendMutation.mutate({ email })}
              disabled={resendMutation.isPending}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 disabled:opacity-50"
            >
              {resendMutation.isPending ? "Sending..." : "Resend it"}
            </button>
          </p>
          <Link
            to="/auth/login"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-1 w-fit mx-auto"
          >
            Return to Login
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
