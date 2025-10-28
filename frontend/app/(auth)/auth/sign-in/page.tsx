"use client";
import {
  LoginInput,
  loginSchema,
  RegisterInput,
  registerSchema,
} from "@/validations/auth/auth.validation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessage";
import { Toaster } from "@/components/ui/sonner";
import { loginWithGoogle, loginWithGithub } from "@/utils/oauth";
import { useOAuthCallback } from "@/hooks/auth/useOAuthCallback";
import { useAuthRoute } from "@/hooks/auth/useProtectedRoute";
import { AuthDebug } from "@/components/debug/AuthDebug";
import Link from "next/link";

const SignInPage = () => {
  useOAuthCallback();
  useAuthRoute();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginUser = signIn();

  const isShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await loginUser.mutateAsync(data);
      toast.success(`Happy to see you ${data.email}`);
      setSuccessMessage("Vérifiez votre email pour activer votre compte");
    } catch (error: any) {
      console.error("Sign In error:", error);

      // Récupérer les détails de l'erreur depuis la réponse du backend
      const backendError = error?.response?.data;

      if (backendError?.errors && Array.isArray(backendError.errors)) {
        // Erreurs de validation Zod du backend
        backendError.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
        setErrorMessage("Veuillez corriger les erreurs de validation");
      } else if (backendError?.message) {
        // Message d'erreur générique du backend
        const message = backendError.message;

        if (message.includes("existe déjà") || message.includes("already exists")) {
          toast.error("Utilisateur déjà existant");
          setErrorMessage("Utilisateur déjà existant");
        } else {
          toast.error(message);
          setErrorMessage(message);
        }
      } else {
        const errorMsg = getErrorMessage(error);
        toast.error(errorMsg || "Une erreur est survenue");
        setErrorMessage(errorMsg || "Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full h-auto my-2 py-2">
      <Toaster position="top-right" duration={5000} />
      <div className="container mx-auto">
        <div className="flex flex-col items-center space-y-4 justify-center">
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              onClick={loginWithGoogle}
              className="flex items-center gap-3 cursor-pointer
                  focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out
                 "
              size="lg"
              disabled={isLoading}
            >
              <FcGoogle />
              <span>Google</span>
            </Button>
            <Button
              type="button"
              onClick={loginWithGithub}
              className="flex items-center gap-3 cursor-pointer
                  focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out
                 "
              size="lg"
              disabled={isLoading}
            >
              <FaGithub />
              <span>GitHub</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span>ou</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="w-[400px] h-full shadow-2xl bg-stone-800 border-none outline-none flex flex-col">
              <CardHeader>
                <CardTitle className="text-center text-white font-inter">
                  Connecter à votre compte
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="border-stone-500 text-white font-inter"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mot de passe"
                    className="border-stone-500 text-white font-inter"
                  />
                  <Button type="button" onClick={isShowPassword} className="absolute top-0 right-0">
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>

                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="text-right ">
                  <Link
                    href="/password/forgot-password"
                    className="text-sm LoginInput text-white hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>

                <Button
                  disabled={loginUser.isPending}
                  type="submit"
                  className="w-full bg-primary text-white font-inter disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 cursor-pointer focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  {loginUser.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
      <AuthDebug />
    </section>
  );
};

export default SignInPage;
