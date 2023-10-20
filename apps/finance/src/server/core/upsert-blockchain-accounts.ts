import { Prisma } from '@prisma/client'
import { Address } from 'viem'
import { db } from '../lib/db'

export async function upsertBlockchainAccounts(accounts: Address[]) {
  const existMap = await findAllExistingAccounts(accounts)
  const result = await db.blockchainAccount.createMany({
    data: skipOrFormatPrisma(accounts, existMap),
  })
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

async function findAllExistingAccounts(accounts: Address[]) {
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
