import { getServerSession } from 'next-auth'
import { authOption } from './auth-option'

export async function getServerAuthSession() {
  return getServerSession(authOption)
}
