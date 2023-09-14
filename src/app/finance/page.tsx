import { format } from 'date-fns'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { getSessionOrSignIn } from '~/server/lib/auth'
import { drizzle } from '~/server/lib/drizzle'
import { userNotionDatabases } from '~/server/lib/drizzle/schema'
import { notion } from '~/server/lib/notion'

export default async function FinancePage() {
  const { user } = await getSessionOrSignIn()
  const database_id = await findUserTransactionDbId(user.id)
  const { results } = await notion.databases.query({
    database_id,
    sorts: [{ property: 'Date', direction: 'descending' }],
  })

  return (
    <main>
      <h1>Transactions</h1>
      <Table>
        <TableHeader>
          <TableHead>Transaction</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
        </TableHeader>
        <TableBody>
          {results.map(formatTransaction).map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.name}</TableCell>
              <TableCell>
                {tx.amount.toLocaleString(undefined, {
                  currency: 'IDR',
                  style: 'currency',
                })}
              </TableCell>
              <TableCell>{format(tx.date, 'EEE dd MMM HH:mm')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

async function findUserTransactionDbId(userId: string) {
  const result = await drizzle
    .select({ databaseId: userNotionDatabases.transactionDatabaseId })
    .from(userNotionDatabases)
    .where(eq(userNotionDatabases.userId, userId))
    .limit(1)
    .then((res) => res.at(0))
  if (result == null) notFound()
  return result.databaseId
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
