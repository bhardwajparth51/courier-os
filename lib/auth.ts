import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const DEMO_USERS: Record<string, { id: string; email: string; name: string; role: Role; password: string }> = {
  "owner@dtdc.demo": {
    id: "demo-owner-id",
    email: "owner@dtdc.demo",
    name: "DTDC Franchise Owner",
    role: "OWNER" as Role,
    password: "owner123",
  },
  "emp1@dtdc.demo": {
    id: "demo-emp1-id",
    email: "emp1@dtdc.demo",
    name: "Counter Operator 1",
    role: "EMPLOYEE" as Role,
    password: "emp123",
  },
  "cust1@dtdc.demo": {
    id: "demo-cust1-id",
    email: "cust1@dtdc.demo",
    name: "Apex Retail Pvt Ltd",
    role: "CUSTOMER" as Role,
    password: "cust123",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const reqEmail = (credentials.email as string).trim().toLowerCase();
        const reqPassword = credentials.password as string;

        // 1. Try DB lookup first
        try {
          const user = await prisma.user.findUnique({
            where: { email: reqEmail },
          });

          if (user && user.password) {
            const passwordMatch = await bcrypt.compare(reqPassword, user.password);
            if (passwordMatch) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
              };
            }
          }
        } catch (dbError) {
          console.warn("[Auth] DB lookup failed, checking demo accounts fallback:", dbError);
        }

        // 2. Demo account fallback (for static demo logins)
        const demoUser = DEMO_USERS[reqEmail];
        if (demoUser && demoUser.password === reqPassword) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
