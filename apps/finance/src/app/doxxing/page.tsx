import { Button } from '~/components/ui/button'
import { AddressInput, DoxxingForm } from './components/doxxing-form'

export default function Page() {
  return (
    <main className='grid min-h-screen place-items-center'>
      <DoxxingForm className='flex w-full max-w-xs flex-col gap-4'>
        <AddressInput autoFocus placeholder='Enter address...' />
        <Button>Submit</Button>
      </DoxxingForm>
    </main>
  )
}
