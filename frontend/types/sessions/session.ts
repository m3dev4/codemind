import { User } from "../user/user";

export interface Session {
  id: string;
  userId: string;
  user: User;
  userAgent: string;
  location: string;
  expiresAt: Date;
  device: string;
  ip: string;
  os: string;
  browser: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}
