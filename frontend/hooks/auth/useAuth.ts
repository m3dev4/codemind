import { useAuthState } from "@/stores/auth/authState";
import { SignInData, SignUpData } from "@/types/user/user";
import instance from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type {
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validations/auth/auth.validation";

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
        router.push("/email/verify-email");
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
      const { setUser, setAuthenticated } = useAuthState.getState();
      if (data.data?.user) {
        setUser(data.data.user);
        setAuthenticated(true);
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

export const verifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: VerifyEmailInput) => {
      const response = await instance.post("/auth/verify-email", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { setUser, setAuthenticated } = useAuthState.getState();
      if (data.data?.user) {
        setUser(data.data.user);
        setAuthenticated(true);
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Verify email error:", error.response?.data || error);
      throw error;
    },
  });
};

export const forgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const response = await instance.post("/auth/forgot-password", data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Forgot password error:", error.response?.data || error);
      throw error;
    },
  });
};

export const resetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const response = await instance.post("/auth/reset-password", data);
      return response.data;
    },
    onSuccess: () => {
      router.push("/auth/sign-in");
    },
    onError: (error: any) => {
      console.error("Reset password error:", error.response?.data || error);
      throw error;
    },
  });
};
