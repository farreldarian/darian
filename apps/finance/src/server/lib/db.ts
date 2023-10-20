import { connect } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client'
import { fetch as undiciFetch } from 'undici'
import { Address } from 'viem'

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

function $type<T>() {
  return <U extends string>(name: U) =>
    ({
      needs: { [name]: true } as Record<U, true>,
      compute: (data: Record<U, unknown>) => data[name] as T,
    }) as const
}

function createPrisma() {
  return new PrismaClient({ adapter: getAdapter() }).$extends({
    result: {
      blockchainAccount: { address: $type<Address>()('address') },
      blockchainAccountLabel: { address: $type<Address>()('address') },
    },
  })
}

function getAdapter() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')
  if (!databaseUrl.includes('psdb.cloud')) return null

  const connection = connect({
    url: process.env.DATABASE_URL,
    fetch: undiciFetch,
  })
  return new PrismaPlanetScale(connection)
}

export type ExtendedPrismaClient = ReturnType<typeof createPrisma>
