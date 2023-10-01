import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export default function VerifyRequestPage() {
  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <div className='flex flex-col items-center gap-8'>
        <h1 className='text-3xl font-bold'>Check your email</h1>
        <p>We&apos;ve sent a temporary login link</p>
        <form action='/api/auth/callback/email' className='grid gap-2'>
          <Input type='text' name='token' placeholder='Enter code' />
          <Input type='email' name='email' placeholder='Enter email' />
          <Button>Continue with login code</Button>
        </form>
      </div>
    </main>
  )
}
