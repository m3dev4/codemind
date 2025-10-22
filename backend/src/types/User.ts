import type { Session } from "./Session.ts";

export type Role = "ADMIN" | "USER";

export type User = {
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
  role: Role;
  sessions: Session[];
};
