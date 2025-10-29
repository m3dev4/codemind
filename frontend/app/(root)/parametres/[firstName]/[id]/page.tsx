"use client";

import { useAuthState } from "@/stores/auth/authState";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ParametrePage = () => {
  const { user } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (user?.firstName && user?.id) {
      router.replace(`/parametres/${user.firstName}/${user.id}/account`);
    }
  }, [user, router]);

  return null;
};

export default ParametrePage;
