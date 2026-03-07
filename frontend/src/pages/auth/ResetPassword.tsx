import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/dataService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => navigate("/auth/login"), 3000); // Auto redirect
    },
    onError: (error) => {
      console.error("Failed to sequence reset password", error);
    }
  });

  const onSubmit = (data: ResetForm) => {
    if (!token) return;
    mutation.mutate({ token, newPassword: data.password });
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl max-w-md mx-auto shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
        <p className="text-gray-500 text-center mb-6">The password reset link is invalid or has expired.</p>
        <Button onClick={() => navigate("/auth/forgot-password")}>Request New Link</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="shadow-2xl border-gray-100 dark:border-zinc-800 backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Password Reset</CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-2xl border-gray-100 dark:border-zinc-800 backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Set New Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below to regain access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                 <Input
                   id="password"
                   type="password"
                   placeholder="••••••••"
                   className="pl-9 w-full"
                   {...register("password")}
                 />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                 <Input
                   id="confirmPassword"
                   type="password"
                   placeholder="••••••••"
                   className="pl-9 w-full"
                   {...register("confirmPassword")}
                 />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {mutation.isError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to reset. The link may have expired.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
