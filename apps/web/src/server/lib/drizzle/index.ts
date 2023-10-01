import { connect } from '@planetscale/database'
import { drizzle as Drizzle } from 'drizzle-orm/planetscale-serverless'

const connection = connect({
  url: process.env.DATABASE_URL,
})

export const drizzle = Drizzle(connection)
