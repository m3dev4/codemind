"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileUser, updateProfileUser } from "@/hooks/auth/userAuth";
import { useAuthState } from "@/stores/auth/authState";
import { UpdateProfileInput, updateProfileSchema } from "@/validations/user/user.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

const AccountPage = () => {
  const { user, isLoading } = useAuthState();
  const { data: profile } = profileUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });
  const { mutateAsync: updateUser, isPending } = updateProfileUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (isLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      // Construire un message basé sur les champs modifiés
      const modifiedFields: string[] = [];

      if (data.firstName && data.firstName !== "") {
        modifiedFields.push("prénom");
      }
      if (data.lastName && data.lastName !== "") {
        modifiedFields.push("nom");
      }
      if (data.username && data.username !== "") {
        modifiedFields.push("nom d'utilisateur");
      }
      if (data.password && data.password !== "") {
        modifiedFields.push("mot de passe");
      }

      // Si aucun champ n'est rempli
      if (modifiedFields.length === 0) {
        toast.warning("Veuillez remplir au moins un champ pour mettre à jour votre profil");
        return;
      }

      // Appeler la mutation et attendre le résultat
      await updateUser(data);

      // Message de succès global
      if (modifiedFields.length === 1) {
        toast.success(`Le ${modifiedFields[0]} a été modifié avec succès`);
      } else {
        toast.success(`Votre profil a été mis à jour avec succès`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Erreur lors de la mise à jour du profil";
      console.error("Error updating profile:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center w-full h-full flex-col">
      <Toaster position="top-right" duration={5000} />
      <div className="container mx-auto py-2">
        <div className="flex items-start gap-2 flex-col">
          <h2 className="text-3xl font-sora font-bold tracking-wide">Paramètres Compte</h2>
          <p className="text-muted-foreground font-sora">Gérez votre compte ainsi sa sécurité</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <Card className="w-full max-w-3xl bg-neutral-800 border-none outline-none my-5 h-auto">
            <CardHeader>
              <CardTitle className=" text-white font-inter">Information Personnelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-3">
                <Label className="text-white font-inter">Prénom</Label>
                <Input
                  {...register("firstName")}
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder={profile?.firstName}
                  className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white font-inter">Nom</Label>
                <Input
                  {...register("lastName")}
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder={profile?.lastName}
                  className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white font-inter">Nom d'utilisateur</Label>
                <Input
                  {...register("username")}
                  id="username"
                  type="text"
                  name="username"
                  placeholder={profile?.username}
                  className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-indigo-500 cursor-pointer hover:bg-indigo-600"
              >
                {isPending ? <Loader2 className="animate-spin" /> : "Mettre à jour"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="py-5">
          <Card className="w-full max-w-3xl bg-neutral-800 border-none outline-none h-auto">
            <CardHeader>
              <CardTitle className=" text-white font-inter">L'email n'est pas modifiable</CardTitle>
            </CardHeader>
            <CardContent className="w-full relative">
              <div className="flex items-center gap-2 justify-center">
                <div className="flex space-x-3 w-full">
                  <Label className="text-white font-inter">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={profile?.email}
                    disabled
                    className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white font-bold max-w-2xl"
                  />
                </div>
                <Badge className="absolute top-1.6 right-6.5 bg-green-700 tracking-wider font-inter">
                  <span>{profile?.emailVerified ? "Verifié" : "Non verifié"}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="py-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="w-full max-w-3xl bg-neutral-800 border-none outline-none h-auto">
              <CardHeader>
                <CardTitle className=" text-white font-inter">Mot de passe & sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <Label className="text-white font-inter">Mot de passe actuel</Label>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    name="password"
                    placeholder="*********"
                    className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-white font-inter">Nouveau mot de passe</Label>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    name="password"
                    placeholder="*********"
                    className="border-neutral-500 rounded-xl focus:border-neutral-700 font-sora text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-500 cursor-pointer hover:bg-indigo-600"
                >
                  Mettre à jour
                </Button>

                <div>{/* Config 2FA plus tard */}</div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="py-5">
          <Card className="w-full max-w-3xl bg-neutral-800 border-none outline-none h-auto">
            <CardHeader>
              <CardTitle className=" text-white font-inter">Supprimer le compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Button
                  type="button"
                  className="w-full rounded-xl bg-red-500 cursor-pointer hover:bg-red-600"
                >
                  Supprimer le compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
