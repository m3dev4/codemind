import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/stores/auth/authState";

/**
 * Hook to protect routes that require authentication
 * Redirects to sign-in if user is not authenticated
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuthState();

  useEffect(() => {
    // Wait for store to be hydrated
    if (!hydrated) return;

    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, hydrated, router]);

  return { isAuthenticated, hydrated };
};

/**
 * Hook to protect auth routes (sign-in, sign-up, etc.)
 * Redirects to dashboard if user is already authenticated
 */
export const useAuthRoute = () => {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuthState();

  useEffect(() => {
    // Wait for store to be hydrated
    if (!hydrated) return;

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, hydrated, router]);

  return { isAuthenticated, hydrated };
};
