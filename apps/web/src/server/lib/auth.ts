import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { init } from '@paralleldrive/cuid2'
import {
  AuthOptions,
  getServerSession as nextAuthGetServerSession,
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { Resend } from 'resend'
import LinearLoginCodeEmail from '~/email/LinearLoginCodeEmail'
import { Routes } from '~/lib/routes'
import { drizzle } from './drizzle'

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOption: AuthOptions = {
  adapter: DrizzleAdapter(drizzle),
  providers: [
    EmailProvider({
      generateVerificationToken() {
        const rand = init({ length: 5 })
        return `${rand()}-${rand()}`
      },
      async sendVerificationRequest(params) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: params.identifier,
          subject: 'Login for Darian',
          text: 'Login for Darian',
          react: LinearLoginCodeEmail({
            token: extractToken(params.url),
            url: params.url,
          }),
        })
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user = user
      return session
    },
  },
  pages: {
    signIn: Routes.login.index,
    verifyRequest: Routes.login.verifyRequest,
  },
}

function extractToken(url: string) {
  const token = new URL(url).searchParams.get('token')
  if (!token) throw new Error('Missing token from url')
  return token
}

export function getServerSession() {
  return nextAuthGetServerSession(authOption)
}

export const getSessionOrSignIn = cache(async () => {
  const session = await nextAuthGetServerSession(authOption)
  if (session?.user != null) return { user: session.user }
  redirect(Routes.login)
})
