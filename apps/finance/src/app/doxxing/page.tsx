import { AccountFormInput } from '~/lib/components/AccountForm'
import { Button } from '~/lib/components/ui/button'
import { DoxxingForm } from './components/doxxing-form'

export default function Page() {
  return (
    <main className='grid min-h-screen place-items-center'>
      <DoxxingForm>
        <AccountFormInput autoFocus placeholder='Enter address...' />
        <Button>Submit</Button>
      </DoxxingForm>
    </main>
  )
}
