"use client";
import { VerifyEmailInput, verifyEmailSchema } from "@/validations/auth/auth.validation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmail } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessage";
import { Toaster } from "@/components/ui/sonner";
import { useAuthState } from "@/stores/auth/authState";
import { useRouter } from "next/navigation";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { pendingEmail, hydrated } = useAuthState();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const verifyEmailMutation = verifyEmail();

  useEffect(() => {
    // Attendre que le store soit hydraté
    if (!hydrated) return;

    if (pendingEmail) {
      // Pré-remplir l'email s'il existe
      setValue("email", pendingEmail);
      setShowEmailInput(false);
    } else {
      // Permettre la saisie manuelle de l'email
      setShowEmailInput(true);
    }
  }, [pendingEmail, hydrated, setValue]);

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      setIsLoading(true);
      await verifyEmailMutation.mutateAsync(data);
      toast.success("Email vérifié avec succès!");
    } catch (error: any) {
      console.error("Verify email error:", error);

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
                    <Mail className="size-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-white font-inter">
                  Vérifier votre email
                </CardTitle>
                <CardDescription className="text-center text-stone-400 font-inter">
                  {pendingEmail
                    ? `Nous avons envoyé un code de vérification à ${pendingEmail}`
                    : "Entrez votre email et le code de vérification reçu"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {showEmailInput ? (
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
                ) : (
                  <div className="hidden">
                    <Input {...register("email")} type="email" name="email" />
                  </div>
                )}

                <div>
                  <Input
                    {...register("code")}
                    id="code"
                    type="text"
                    name="code"
                    placeholder="Code à 6 chiffres"
                    className="border-stone-500 text-white font-inter text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1 text-center">{errors.code.message}</p>
                  )}
                </div>

                <Button
                  disabled={verifyEmailMutation.isPending}
                  type="submit"
                  className="w-full bg-primary text-white font-inter disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 cursor-pointer focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  {verifyEmailMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Vérifier"
                  )}
                </Button>

                <div className="text-center text-sm text-stone-400">
                  Vous n'avez pas reçu le code?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => toast.info("Fonctionnalité à venir")}
                  >
                    Renvoyer
                  </button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmailPage;
