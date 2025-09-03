import { UserRole, VerificationStatus } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      verificationStatus: VerificationStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    verificationStatus: VerificationStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    verificationStatus: VerificationStatus;
  }
}
