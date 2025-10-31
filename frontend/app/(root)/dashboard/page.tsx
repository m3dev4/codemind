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
    <div>
      <h1 className="text-white">Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
