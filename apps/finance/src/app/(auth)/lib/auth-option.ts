import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { AuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { generate } from 'random-words'
import { Resend } from 'resend'
import { z } from 'zod'
import { Routes } from '~/app/routes'
import { db } from '~/server/db'
import LinearLoginCodeEmail from './email-templates/linear-login-code-email'

const userSessionFromParamSchema = z
  .object({
    token: z.object({
      email: z.string().email(),
      sub: z.string().cuid2(),
    }),
  })
  .transform((params) => ({
    id: params.token.sub,
    email: params.token.email,
  }))

export const authOption: AuthOptions = {
  // next-auth uses direct `PrismaClient` meanwhile we use the $extended version
  adapter: PrismaAdapter(db as unknown as PrismaClient),
  session: {
    strategy: 'jwt',
  },
  providers: [
    EmailProvider({
      generateVerificationToken() {
        return generate({ exactly: 3, join: '-' })
      },
      async sendVerificationRequest(params) {
        await getResend().emails.send({
          from: getEnv().EMAIL_FROM,
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
    async session(params) {
      params.session.user = userSessionFromParamSchema.parse(params)
      return params.session
    },
  },
  pages: {
    signIn: Routes.auth.signIn,
    verifyRequest: Routes.auth.verifyRequest,
  },
}

const envSchema = z.object({
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().email(),
})

function getEnv() {
  return envSchema.parse(process.env)
}

function getResend() {
  return new Resend(getEnv().RESEND_API_KEY)
}

function extractToken(url: string) {
  const token = new URL(url).searchParams.get('token')
  if (!token) throw new Error('Missing token from url')
  return token
}
