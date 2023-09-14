import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getServerSession } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { drizzle } from './drizzle'

export const authOption = {
  adapter: DrizzleAdapter(drizzle),
  providers: [
    EmailProvider({
      server: `smtp://resend:${process.env.RESEND_API_KEY}@smtp.resend.com:587`,
      from: process.env.EMAIL_FROM,
    }),
  ],
}

export const getSessionOrSignIn = cache(async () => {
  const session = await getServerSession(authOption)
  if (session) return session
  redirect('/api/auth/signin')
})
