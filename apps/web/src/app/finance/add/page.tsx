import { notFound } from 'next/navigation'
import { z } from 'zod'
import ReactQueryProvider from '~/lib/react-query'
import { getSessionOrSignIn } from '~/server/lib/auth'
import { notion } from '~/server/lib/notion'
import { findUserTransactionDbId } from '../_lib/queries/find-user-transaction-db-id'
import { tagSchema } from '../_lib/tag'
import AddExpenseForm from './AddExpenseForm'

export default async function AddExpensePage() {
  const { user } = await getSessionOrSignIn()
  const databaseId = await findUserTransactionDbId(user.id)
  if (!databaseId) notFound()
  const tags = await fetchTags(databaseId)
  return (
    <ReactQueryProvider>
      <AddExpenseForm databaseId={databaseId} tags={tags} />
    </ReactQueryProvider>
  )
}

const fetchTagsSchema = z.object({
  properties: z.object({
    Tags: z.object({
      id: z.string(),
      name: z.literal('Tags'),
      multi_select: z.object({
        options: z.array(tagSchema),
      }),
    }),
  }),
})

async function fetchTags(database_id: string) {
  const res = await notion.databases.retrieve({ database_id })
  return fetchTagsSchema.parse(res).properties.Tags.multi_select.options
}
