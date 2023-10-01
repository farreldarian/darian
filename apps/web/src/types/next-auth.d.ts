import NextAuth from 'next-auth' // organize-imports-ignore
import type { AuthUser } from 'auth/user'
import { AdapterUser } from 'next-auth/adapters'

declare module 'next-auth' {
  type User = AdapterUser
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User
  }
}
