import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'
import { findUserTransactionDbId } from '~/app/finance/_lib/queries/find-user-transaction-db-id'
import { addTransactionSchema } from '~/app/finance/_lib/zod-schemas'
import { getServerSession } from '~/server/lib/auth'
import { notion } from '~/server/lib/notion'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  const database_id = await findUserTransactionDbId(session.user.id)
  if (!database_id) notFound()

  const input = addTransactionSchema.safeParse(await request.json())
  if (!input.success) return new Response('Invalid input', { status: 400 })

  await notion.pages.create({
    auth: process.env.NOTION_TOKEN,
    parent: { database_id },
    properties: {
      Transaction: { title: [{ text: { content: input.data.name } }] },
      Amount: { number: -input.data.amount },
      Date: { date: { start: format(input.data.date, 'yyyy-MM-dd') } },
      Type: { select: { name: 'Variable' } },
      ...(input.data.tag && {
        Tags: { multi_select: [{ id: input.data.tag.id }] },
      }),
    },
  })
  return new Response('Success', { status: 200 })
}
