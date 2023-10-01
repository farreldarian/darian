import { eq } from 'drizzle-orm'
import { drizzle } from '~/server/lib/drizzle'
import { userNotionDatabases } from '~/server/lib/drizzle/schema'

export async function findUserTransactionDbId(userId: string) {
  return drizzle
    .select({ databaseId: userNotionDatabases.transactionDatabaseId })
    .from(userNotionDatabases)
    .where(eq(userNotionDatabases.userId, userId))
    .limit(1)
    .then((res) => res.at(0)?.databaseId)
}
