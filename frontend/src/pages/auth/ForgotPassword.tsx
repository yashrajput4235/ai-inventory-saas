import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/dataService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const forgotSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      console.error("Failed to sequence reset password email", error);
    }
  });

  const onSubmit = (data: ForgotForm) => {
    mutation.mutate({ email: data.email });
  };

  if (isSubmitted) {
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
            <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a password reset link to <br/>
              <span className="font-semibold text-gray-900 dark:text-white mt-1 block">
                {getValues("email")}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => navigate("/auth/login")}
            >
              Back to Login
            </Button>
          </CardContent>
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
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                 <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                 <Input
                   id="email"
                   type="email"
                   placeholder="name@example.com"
                   className="pl-9 w-full"
                   {...register("email")}
                 />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {mutation.isError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                There was a problem sending the reset link.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending instructions...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t border-gray-100 dark:border-zinc-800 pt-6 text-center">
           <Link
             to="/auth/login"
             className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
           >
             Go back to login
           </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
