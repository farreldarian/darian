import { differenceInCalendarDays, format, isToday } from 'date-fns'
import { groupBy, mapValues } from 'lodash'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Routes } from '~/lib/routes'
import { getSessionOrSignIn } from '~/server/lib/auth'
import { notion } from '~/server/lib/notion'
import { findUserTransactionDbId } from './_lib/queries/find-user-transaction-db-id'

export default async function FinancePage() {
  const { user } = await getSessionOrSignIn()
  const database_id = await findUserTransactionDbId(user.id)
  if (!database_id) notFound()
  const transactions = await fetchTransactions(database_id)

  const groupedTransactions = mapValues(
    groupBy(transactions, (tx) => format(tx.date, 'yyyyMMMdd')),
    (txs) => ({
      date: txs[0].date,
      txs: txs,
    })
  )
  const todayTransactions = transactions.filter((tx) => isToday(tx.date))
  const todaySpending = todayTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => acc + tx.amount, 0)

  return (
    <main>
      <div className='grid min-h-screen place-items-center'>
        <Button asChild>
          <Link href={Routes.finance.add}>Add</Link>
        </Button>
      </div>

      <div className='hidden h-[calc(100vh-56px)] grid-cols-[1fr,384px] lg:grid'>
        <div className='overflow-auto'>
          {Object.values(groupedTransactions).map(({ txs, date }) => {
            const diffDays = differenceInCalendarDays(new Date(), date)

            return (
              <>
                <h2 className='flex h-10 items-center bg-muted px-6 text-sm font-medium'>
                  {diffDays === 0
                    ? 'Today'
                    : diffDays === 1
                    ? 'Yesterday'
                    : format(date, 'EEE dd MMM')}
                </h2>
                <div>
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className='flex h-12 items-center justify-between border-b px-6 text-sm transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                    >
                      <p className='font-medium'>{tx.name}</p>
                      <span className='flex items-center'>
                        <p>{formatCurrency(tx.amount)}</p>
                        <p className='w-16 text-right'>
                          {format(tx.date, 'HH:mm')}
                        </p>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )
          })}
        </div>

        <div className='border-l bg-background p-6'>
          <div className='space-y-1.5'>
            <p className='font-medium'>Today Spending</p>
            <p className='text-2xl font-bold'>
              {formatCurrency(todaySpending)}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

const resultSchema = z.object({
  id: z.string(),
  properties: z.object({
    Transaction: z.object({
      title: z.array(z.object({ plain_text: z.string() })),
    }),
    Amount: z.object({
      number: z.number(),
    }),
    Date: z.object({
      date: z.object({
        start: z.coerce.date(),
      }),
    }),
  }),
})

async function fetchTransactions(database_id: string) {
  return notion.databases
    .query({
      database_id,
      sorts: [{ property: 'Date', direction: 'descending' }],
    })
    .then((res) => res.results.map(formatTransaction))
}

function formatTransaction(result: unknown) {
  const parsed = resultSchema.parse(result)

  return {
    id: parsed.id,
    name: formatRichText(parsed.properties.Transaction.title),
    amount: parsed.properties.Amount.number,
    date: parsed.properties.Date.date.start,
  }
}

function formatRichText(richTexts: { plain_text: string }[]) {
  return richTexts.map((t) => t.plain_text).join(' ')
}

function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, {
    currency: 'IDR',
    style: 'currency',
  })
}
