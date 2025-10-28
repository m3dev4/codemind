"use client";
import { ResetPasswordInput, resetPasswordSchema } from "@/validations/auth/auth.validation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessage";
import { Toaster } from "@/components/ui/sonner";
import { useAuthRoute } from "@/hooks/auth/useProtectedRoute";
import { useSearchParams, useRouter } from "next/navigation";

const ResetPasswordPage = () => {
  useAuthRoute();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = resetPassword();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setValue("token", token);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setIsLoading(true);
      await resetPasswordMutation.mutateAsync(data);
      toast.success("Mot de passe réinitialisé avec succès!");
    } catch (error: any) {
      console.error("Reset password error:", error);

      const backendError = error?.response?.data;

      if (backendError?.errors && Array.isArray(backendError.errors)) {
        backendError.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else if (backendError?.message) {
        toast.error(backendError.message);
      } else {
        const errorMsg = getErrorMessage(error);
        toast.error(errorMsg || "Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full h-auto my-2 py-2">
      <Toaster position="top-right" duration={5000} />
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="w-[400px] h-full shadow-2xl bg-stone-800 border-none outline-none flex flex-col">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <KeyRound className="size-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-white font-inter">
                  Nouveau mot de passe
                </CardTitle>
                <CardDescription className="text-center text-stone-400 font-inter">
                  Entrez votre nouveau mot de passe
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="hidden">
                  <Input {...register("token")} type="text" name="token" />
                </div>

                <div className="relative">
                  <Input
                    {...register("newPassword")}
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Nouveau mot de passe"
                    className="border-stone-500 text-white font-inter"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-0 right-0"
                    variant="ghost"
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>

                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="text-xs text-stone-400 space-y-1">
                  <p>Le mot de passe doit contenir:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Au moins 8 caractères</li>
                    <li>Une lettre majuscule</li>
                    <li>Une lettre minuscule</li>
                    <li>Un chiffre</li>
                  </ul>
                </div>

                <Button
                  disabled={resetPasswordMutation.isPending}
                  type="submit"
                  className="w-full bg-primary text-white font-inter disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 cursor-pointer focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  {resetPasswordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
