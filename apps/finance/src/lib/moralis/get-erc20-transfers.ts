import { Address, toHex } from 'viem'
import { z } from 'zod'
import { address, hash } from '../zod-schema'
import { Moralis } from './moralis'

export async function getErc20Transfers(
  moralis: Moralis,
  args: {
    account: Address
    chainId: number
    limit?: number
    cursor?: string
  }
) {
  const url = moralis.createUrl(`/api/v2.2/${args.account}/erc20/transfers`)
  url.searchParams.set('chain', String(toHex(args.chainId)))
  if (args.limit) url.searchParams.set('limit', String(args.limit))
  if (args.cursor) url.searchParams.set('cursor', String(args.cursor))

  return moralis.fetch({ schema, url })
}

const schema = z.object({
  page: z.number().min(0),
  page_size: z.number().min(0),
  cursor: z.string().nullable(),
  result: z
    .object({
      transaction_hash: hash(),
      from_address: address(),
      to_address: address(),
    })
    .array(),
})
