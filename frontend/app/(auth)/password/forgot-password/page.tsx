"use client";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/validations/auth/auth.validation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessage";
import { Toaster } from "@/components/ui/sonner";
import { useAuthRoute } from "@/hooks/auth/useProtectedRoute";
import Link from "next/link";

const ForgotPasswordPage = () => {
  useAuthRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = forgotPassword();

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setIsLoading(true);
      await forgotPasswordMutation.mutateAsync(data);
      toast.success("Email de réinitialisation envoyé!");
      setEmailSent(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);

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
                  Mot de passe oublié?
                </CardTitle>
                <CardDescription className="text-center text-stone-400 font-inter">
                  {emailSent
                    ? `Un email a été envoyé à ${getValues("email")}`
                    : "Entrez votre email pour recevoir un lien de réinitialisation"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {!emailSent ? (
                  <>
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

                    <Button
                      disabled={forgotPasswordMutation.isPending}
                      type="submit"
                      className="w-full bg-primary text-white font-inter disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 cursor-pointer focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                      {forgotPasswordMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Envoyer le lien"
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-stone-300 text-sm">
                      Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser
                      votre mot de passe.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setEmailSent(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Renvoyer l'email
                    </Button>
                  </div>
                )}

                <div className="text-center">
                  <Link
                    href="/auth/sign-in"
                    className="text-sm text-white hover:underline inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
