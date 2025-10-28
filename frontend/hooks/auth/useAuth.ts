import { useAuthState } from "@/stores/auth/authState";
import { SignInData, SignUpData } from "@/types/user/user";
import instance from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const signUp = () => {
  const router = useRouter();
  const { setPendingVerification, setIsLoading } = useAuthState();

  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await instance.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.user?.email) {
        setPendingVerification(data.data.user.email);
        router.push("/auth/verify-email");
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error.response?.data || error);
      throw error;
    },
  });
};

export const signIn = () => {
  const router = useRouter();
  const { setIsLoading, setPendingVerification, setError } = useAuthState();

  return useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await instance.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { setUser } = useAuthState.getState();
      if (data.data?.user) {
        setUser(data.data.user);
        useAuthState.setState({ isAuthenticated: true });
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      setError(true);
      console.error("Login error:", error.response?.data || error);
      throw error;
    },
  });
};
