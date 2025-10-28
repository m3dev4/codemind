"use client";
import { useAuthState } from "@/stores/auth/authState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import instance from "@/utils/axios";

const DashboardPage = () => {
  const router = useRouter();
  const { user, logout } = useAuthState();

  const handleLogout = async () => {
    try {
      await instance.post("/auth/logout");
      logout();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even on error
      logout();
      router.push("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Déconnexion
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">Informations du Profil</CardTitle>
            </CardHeader>
            <CardContent className="text-stone-300">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Nom:</span> {user?.firstName} {user?.lastName}
                </p>
                <p>
                  <span className="font-semibold">Username:</span> {user?.username}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-semibold">Rôle:</span> {user?.role}
                </p>
                <p>
                  <span className="font-semibold">Email vérifié:</span>{" "}
                  {user?.emailVerified ? "✅ Oui" : "❌ Non"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">Bienvenue</CardTitle>
            </CardHeader>
            <CardContent className="text-stone-300">
              <p>
                Bienvenue sur votre dashboard, {user?.firstName}! Vous êtes maintenant connecté(e).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
