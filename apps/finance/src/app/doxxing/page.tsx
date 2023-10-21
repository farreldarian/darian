import { Button } from '~/components/ui/button'
import { buttonGroup } from '~/components/ui/button/recipes'
import { cn } from '~/lib/utils'
import { AddressInput, DoxxingForm } from './components/doxxing-form'

export default function Page() {
  return (
    <main className='grid min-h-screen place-items-center'>
      <DoxxingForm className={cn(buttonGroup(), 'w-full max-w-xs')}>
        <AddressInput autoFocus placeholder='Enter address...' />
        <Button>Submit</Button>
      </DoxxingForm>
    </main>
  )
}
