import { authOptions } from "@lib/auth";
import NextAuth from "next-auth/next";
// ou o caminho onde você salvou

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };