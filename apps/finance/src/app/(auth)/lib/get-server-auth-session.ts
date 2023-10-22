import { getServerSession } from 'next-auth'
import { authOption } from './auth-option'

export async function getServerAuthSession() {
  return getServerSession(authOption)
}

export async function getRequiredServerAuthSession() {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
