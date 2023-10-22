import { Address, isAddressEqual } from 'viem'
import { arbitrum, avalanche, bsc, mainnet, polygon } from 'viem/chains'
import { getRequiredServerAuthSession } from '~/app/(auth)/lib/get-server-auth-session'
import { upsertBlockchainAccounts } from '~/core/account/upsert-blockchain-accounts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/lib/components/ui/table'
import { getErc20Transfers } from '~/lib/moralis/get-erc20-transfers'
import { getWalletActiveChains } from '~/lib/moralis/get-wallet-active-chains'
import { getMoralis } from '~/lib/moralis/moralis'
import { db } from '~/server/db'

const CHAINS = [mainnet, polygon, bsc, avalanche, arbitrum]

type Props = {
  params: { account: Address }
}

export default async function Page(props: Props) {
  const [session, accountAddresses] = await Promise.all([
    getRequiredServerAuthSession(),
    (async () => {
      const chains = await fetchActiveChains(props.params.account)
      return fetchAccountsInteracted(
        props.params.account,
        chains.map((chain) => chain.chain_id)
      )
    })(),
  ])
  const [accounts] = await Promise.all([
    fetchDetailedAccounts(accountAddresses, session.user.id),
    upsertBlockchainAccounts(accountAddresses),
  ])

  return (
    <main>
      <h1>{props.params.account}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Labels</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.address}>
              <TableCell>{account.address}</TableCell>
              <TableCell>
                {account.labels.map((label) => label.name).join(', ')}
              </TableCell>
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
    if (isAddressEqual(address, account)) return // Skip adding self
    accountsSet.add(address)
  }

  for await (const chainId of chainIds) {
    let cursor: string | undefined = undefined
    do {
      const erc20Transfers = await getErc20Transfers(getMoralis(), {
        account: account,
        chainId: chainId,
        cursor,
      })
      erc20Transfers.result.forEach((transfer) => {
        add(transfer.from_address)
        add(transfer.to_address)
      })

      cursor = erc20Transfers.cursor ?? undefined
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

async function fetchDetailedAccounts(
  accountAddresses: Address[],
  userId: string
) {
  const accountsStored = await db.blockchainAccount.findMany({
    where: { address: { in: accountAddresses } },
    select: {
      address: true,
      labels: {
        select: { name: true },
        where: { OR: [{ creatorId: null }, { creatorId: userId }] },
      },
    },
  })
  const existMap = accountsStored.reduce(
    (map, account) => map.set(account.address, true),
    new Map<Address, boolean>()
  )

  return accountsStored.concat(
    // Combine the accounts that are not stored,
    // the data is being stored in parallel
    accountAddresses.flatMap((address) => {
      if (existMap.has(address)) return []
      return [{ address, labels: [] }]
    })
  )
}
