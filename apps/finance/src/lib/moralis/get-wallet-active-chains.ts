import { Address, isHash, toHex } from 'viem'
import { z } from 'zod'
import { Moralis } from './moralis'

export async function getWalletActiveChains(
  moralis: Moralis,
  args: {
    account: Address
    chains?: number[]
  }
) {
  const url = moralis.createUrl(`/api/v2.2/wallets/${args.account}/chains`)
  args.chains?.forEach((chainId) => {
    url.searchParams.append('chains', toHex(chainId))
  })

  return moralis.fetch({ schema, url })
}

const schema = z.object({
  active_chains: z
    .object({
      chain: z.string(),
      chain_id: z.coerce.number(),
      first_transaction: z
        .object({ transaction_hash: z.string().refine(isHash) })
        .nullable(),
      last_transaction: z
        .object({ transaction_hash: z.string().refine(isHash) })
        .nullable(),
    })
    .array(),
})
