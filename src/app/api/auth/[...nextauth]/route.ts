import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "~/server/lib/drizzle";

const handler = NextAuth({
  adapter: DrizzleAdapter(drizzle),
  providers: [
    EmailProvider({
      server: `smtp://resend:${process.env.RESEND_API_KEY}@smtp.resend.com:587`,
      from: process.env.EMAIL_FROM,
    }),
  ],
});

export { handler as GET, handler as POST };
