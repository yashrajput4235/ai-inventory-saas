import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Building, User, Mail, Lock, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { registerOrgAdmin } from "@/services/dataService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerOrgAdmin,
    onSuccess: (data) => {
      localStorage.setItem("userRole", data?.user?.role || data?.role || "admin");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    }
  });

  const onSubmit = (data: RegisterForm) => {
    // Only send the fields expected by API
    const payload = {
      organizationName: data.organizationName,
      name: data.name,
      email: data.email,
      password: data.password
    };
    registerMutation.mutate(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-2xl border-gray-100 dark:border-zinc-800 backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 w-full max-w-lg mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create an Organization
          </CardTitle>
          <CardDescription className="text-center">
            Start managing your inventory with AI forecasts today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="organizationName"
                  placeholder="Acme Corp"
                  className="pl-9"
                  {...register("organizationName")}
                />
              </div>
              {errors.organizationName && (
                <p className="text-sm text-red-500 font-medium">{errors.organizationName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  className="pl-9"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@acme.com"
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
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
                    className="pl-9"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {registerMutation.isError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2 font-medium mt-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {(registerMutation.error as any)?.response?.data?.message || "Registration failed. Email may be taken or server down."}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t border-gray-100 dark:border-zinc-800 mt-4 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
