import { Prisma } from '@prisma/client'
import { Address } from 'viem'
import { PrismaClientTx, db } from '../../server/db'

export async function upsertBlockchainAccounts(accounts: Address[]) {
  const result = await db.$transaction(async (tx) => {
    const existMap = await findAllExistingAccounts(tx, accounts)
    const missing = skipOrFormatPrisma(accounts, existMap)
    if (missing.length === 0) return 'skipped' as const
    return tx.blockchainAccount.createMany({ data: missing })
  })
  if (result === 'skipped') return
  console.info(`Upserted ${result.count} blockchain accounts`)
}

function skipOrFormatPrisma(accounts: Address[], existMap: Map<Address, true>) {
  return accounts.flatMap<Prisma.BlockchainAccountCreateManyInput>(
    (account) => {
      if (existMap.has(account)) return []
      return [{ address: account }]
    }
  )
}

async function findAllExistingAccounts(
  db: PrismaClientTx,
  accounts: Address[]
) {
  const existing = await db.blockchainAccount.findMany({
    where: { address: { in: accounts } },
    select: { address: true },
  })
  return reduceToMap(existing, (account) => account.address)
}

function reduceToMap<TKey extends string, TData>(
  list: TData[],
  getKey: (data: TData) => TKey
) {
  return list.reduce(
    (map, data) => map.set(getKey(data), true),
    new Map<TKey, true>()
  )
}
