import { Address } from 'viem'
import { arbitrum, avalanche, bsc, mainnet, polygon } from 'viem/chains'
import { getWalletActiveChains } from '~/lib/moralis/get-wallet-active-chains'
import { getMoralis } from '~/lib/moralis/moralis'

type Props = {
  params: { account: Address }
}

export default async function Page(props: Props) {
  const chains = await fetchActiveChains(props.params.account)

  return (
    <main>
      <h1>{props.params.account}</h1>
      <ol>
        {chains.map((chain) => (
          <li key={chain.chain_id}>{chain.chain}</li>
        ))}
      </ol>
    </main>
  )
}

async function fetchActiveChains(account: Address) {
  return getWalletActiveChains(getMoralis(), {
    account,
    chains: [mainnet.id, polygon.id, bsc.id, avalanche.id, arbitrum.id],
  }).then((chains) =>
    // Should have first transaction
    chains.active_chains.filter((chain) => chain.first_transaction != null)
  )
}
