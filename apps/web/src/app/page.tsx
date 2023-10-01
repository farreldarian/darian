import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Routes } from '~/lib/routes'

export default function Home() {
  return (
    <main>
      <Button asChild>
        <Link href={Routes.finance.add}>Add Expense</Link>
      </Button>
    </main>
  )
}
