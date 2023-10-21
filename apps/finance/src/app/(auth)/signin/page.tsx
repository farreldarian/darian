import { Suspense } from 'react'
import { EmailInput } from './components/email-input'
import { ErrorToaster } from './components/error-toaster'

export default async function LoginPage() {
  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <div className='flex w-full max-w-xs flex-col gap-8'>
        <h1 className='text-center text-3xl font-bold'>Sign in</h1>
        <EmailInput />
      </div>

      <Suspense>
        <ErrorToaster />
      </Suspense>
    </main>
  )
}
