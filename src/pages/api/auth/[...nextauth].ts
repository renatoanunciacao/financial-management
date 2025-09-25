import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@lib/prisma";
import bcrypt from "bcrypt";
import { AuthProvider } from "generated/prisma";


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user?.authProvider !== AuthProvider.credentials) {
          return null;
        }

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid || credentials.email !== user.email) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user?.name || "",
            picture: user?.image || "",
            authProvider: AuthProvider.google,
          },
        });
      } else {
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            name: user.name || existingUser.name,
            picture: user.image || existingUser.picture,
          }
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        token.id = dbUser?.id ?? token.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
