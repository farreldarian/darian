import { Button } from '~/lib/components/ui/button'
import { buttonGroup } from '~/lib/components/ui/button/recipes'
import { Input } from '~/lib/components/ui/input'
import { CallbackUrlInput } from './compoennts/callback-url-input'

export default function VerifyRequestPage() {
  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <div className='flex w-full max-w-xs flex-col gap-8'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Check your email</h1>
          <p>We&apos;ve sent a temporary login link</p>
        </div>
        <form action='/api/auth/callback/email' className={buttonGroup()}>
          <CallbackUrlInput />
          <Input type='text' name='token' placeholder='Enter code' />
          <Input type='email' name='email' placeholder='Enter email' />
          <Button type='submit'>Continue with login code</Button>
        </form>
      </div>
    </main>
  )
}
