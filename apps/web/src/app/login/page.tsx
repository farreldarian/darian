import { getCsrfToken } from 'next-auth/react'
import EmailInput from './EmailInput'

export default async function LoginPage() {
  const csrfToken = await getCsrfToken()
  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <div className='flex flex-col items-center gap-8'>
        <h1 className='text-3xl font-bold'>Login</h1>
        <EmailInput />
      </div>
    </main>
  )
}
