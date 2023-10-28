import { AccountFormInput } from '~/lib/components/AccountForm'
import { Button } from '~/lib/components/ui/button'
import { YieldForm } from './_lib/yield-form'

export default function Page() {
  return (
    <main className='grid min-h-screen place-items-center'>
      <YieldForm>
        <AccountFormInput autoFocus placeholder='Enter address...' />
        <Button>Submit</Button>
      </YieldForm>
    </main>
  )
}
