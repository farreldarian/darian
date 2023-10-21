import { withAuth } from 'next-auth/middleware'
import { Routes } from '~/lib/routes'

const middleware = withAuth({
  pages: {
    signIn: Routes.auth.signIn,
    verifyRequest: Routes.auth.verifyRequest,
  },
})
export default middleware

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).+)'],
}
