import { Address, PublicClient } from 'viem'
import { erc20ABI } from 'wagmi'

export function getBalancesOnBlocks(args: {
  account: Address
  publicClient: PublicClient
  token: Address
  blockNumbers: bigint[]
}) {
  return Promise.all(
    args.blockNumbers.map((blockNumber) =>
      args.publicClient.readContract({
        address: args.token,
        abi: erc20ABI,
        functionName: 'balanceOf',
        blockNumber: blockNumber,
        args: [args.account],
      })
    )
  )
}
