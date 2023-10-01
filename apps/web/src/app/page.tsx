import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Routes } from '~/lib/routes'
import LogoutButton from './LogoutButton'

export default function Home() {
  return (
    <main>
      <Button asChild>
        <Link href={Routes.finance.add}>Add Expense</Link>
      </Button>
      <LogoutButton />
    </main>
  )
}
