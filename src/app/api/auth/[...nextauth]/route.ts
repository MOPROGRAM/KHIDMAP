import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import EmailProvider from "next-auth/providers/email";

const prisma = new PrismaClient()

import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
