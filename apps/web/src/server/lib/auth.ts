import { DrizzleAdapter } from '@auth/drizzle-adapter'
import {
  AuthOptions,
  getServerSession as nextAuthGetServerSession,
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { drizzle } from './drizzle'

export const authOption: AuthOptions = {
  adapter: DrizzleAdapter(drizzle),
  providers: [
    EmailProvider({
      server: `smtp://resend:${process.env.RESEND_API_KEY}@smtp.resend.com:587`,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user = user
      return session
    },
  },
}

export function getServerSession() {
  return nextAuthGetServerSession(authOption)
}

export const getSessionOrSignIn = cache(async () => {
  const session = await nextAuthGetServerSession(authOption)
  if (session?.user != null) return { user: session.user }
  redirect('/api/auth/signin')
})
