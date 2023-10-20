import { connect } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client'
import { fetch as undiciFetch } from 'undici'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

function createPrisma() {
  const connection = connect({
    url: process.env.DATABASE_URL,
    fetch: undiciFetch,
  })
  const adapter = new PrismaPlanetScale(connection)
  return new PrismaClient({ adapter })
}
