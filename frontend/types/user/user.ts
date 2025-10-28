import { ROLE } from "@/enum/role";
import { Session } from "../sessions/session";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: ROLE.ADMIN | ROLE.USER;
  googleId: string | null;
  githubId: string | null;
  picture: string | null;
  sessions: Session[];
}

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
}


export interface SignInData {
    email: string;
    password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean | null;
  error: boolean | null;
  isAuthenticated: boolean | null;
  pendingEmail: string | null;
  hydrated: boolean | null;

  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  me: () => Promise<User | null>;
  logout: () => void;
  setIsLoading: (isLoading: boolean | null) => void;
  setError: (error: boolean | null) => void;
  setPendingVerification: (email: string) => void;
  setEmailVerified: (emailVerified: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  //Getters
  needsEmailVerifcation: () => boolean;
  isAdmin: () => boolean;
  getUserRole: () => ROLE;
}
