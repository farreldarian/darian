import { Address, isAddressEqual } from 'viem'
import { arbitrum, avalanche, bsc, mainnet, polygon } from 'viem/chains'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { getErc20Transfers } from '~/lib/moralis/get-erc20-transfers'
import { getWalletActiveChains } from '~/lib/moralis/get-wallet-active-chains'
import { getMoralis } from '~/lib/moralis/moralis'

const CHAINS = [mainnet, polygon, bsc, avalanche, arbitrum]

type Props = {
  params: { account: Address }
}

export default async function Page(props: Props) {
  const chains = await fetchActiveChains(props.params.account)
  const accounts = await fetchAccountsInteracted(
    props.params.account,
    chains.map((chain) => chain.chain_id)
  )

  return (
    <main>
      <h1>{props.params.account}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chain</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account}>
              <TableCell>{account}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}

async function fetchAccountsInteracted(account: Address, chainIds: number[]) {
  const accountsSet = new Set<Address>()
  const add = (address: Address) => {
    if (isAddressEqual(address, account)) return
    accountsSet.add(address)
  }

  for await (const chainId of chainIds) {
    let cursor: string | undefined = undefined
    do {
      const transfers = await getErc20Transfers(getMoralis(), {
        account: account,
        chainId: chainId,
        cursor,
      })
      transfers.result.forEach((transfer) => {
        add(transfer.from_address)
        add(transfer.to_address)
      })

      cursor = transfers.cursor ?? undefined
    } while (cursor != null)
  }
  return Array.from(accountsSet.values())
}

async function fetchActiveChains(account: Address) {
  return getWalletActiveChains(getMoralis(), {
    account,
    chains: CHAINS.map((chain) => chain.id),
  }).then((chains) =>
    // Should have first transaction
    chains.active_chains.filter((chain) => chain.first_transaction != null)
  )
}
