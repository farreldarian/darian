import { getUnixTime } from 'date-fns'
import { isHash, toHex } from 'viem'
import { z } from 'zod'
import { Moralis } from './moralis'

export function getDateToBlock(
  moralis: Moralis,
  args: { date: Date; chainId: number }
) {
  const url = moralis.createUrl('/api/v2.2/dateToBlock')
  url.searchParams.set('date', getUnixTime(args.date).toString())
  url.searchParams.set('chain', toHex(args.chainId))

  return moralis.fetch({ schema, url })
}

const schema = z.object({
  date: z.coerce.date(),
  block: z.coerce.bigint(),
  timestamp: z.number(),
  block_timestamp: z.coerce.date(),
  hash: z.string().refine(isHash),
  parent_hash: z.string().refine(isHash),
})
export type GetDateToBLockResponse = z.infer<typeof schema>
