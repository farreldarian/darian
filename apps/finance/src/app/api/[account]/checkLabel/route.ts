import { NextRequest } from 'next/server'
import { Address, isAddress } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
} from 'viem/chains'
import { getPublicNameTag } from '~/lib/etherscan/get-public-name-tag'
import { db } from '~/server/lib/db'

const SUPPORTED_CHAINS = [
  mainnet,
  // l2
  arbitrum,
  base,
  optimism,
  // sidechains
  polygon,
  bsc,
  avalanche,
]

export async function GET(
  request: NextRequest,
  { params }: { params: { account: string } }
) {
  if (!isAddress(params.account))
    return new Response('Invalid address', { status: 400 })

  const lastCheck = await findLastCheck(params.account)
  if (isUpToDate(lastCheck)) {
    return new Response('Up to date', { status: 200 })
  }

  const chain = getChainById(Number(extractChainParam(request) ?? 1))
  if (!chain) {
    return new Response('Invalid chain', { status: 400 })
  }

  const tag = await getPublicNameTag(chain, params.account)
  if (tag) {
    await setTag(tag, params.account)
  }

  await upsertLastCheck(params.account)
  console.info(`Checked ${params.account}`)
  return new Response('OK', { status: 200 })
}

async function setTag(tag: string, account: Address) {
  await db.blockchainAccountLabel.create({
    data: { name: tag, address: account },
  })
  console.info(`Assigned ${tag} to ${account}`)
}

async function upsertLastCheck(account: Address) {
  await db.blockchainAccountLabelLastCheck.upsert({
    where: { address: account },
    update: { checkedAt: new Date() },
    create: { address: account, checkedAt: new Date() },
  })
}

function extractChainParam(request: NextRequest) {
  return request.nextUrl.searchParams.get('chain')
}

function findLastCheck(account: Address) {
  return db.blockchainAccountLabelLastCheck.findUnique({
    where: { address: account },
  })
}

function isUpToDate(lastCheck: { checkedAt: Date } | null) {
  if (lastCheck == null) return false
  const diff = Date.now() - lastCheck.checkedAt.getTime()
  return diff <= 2_629_746_000 // 1 month
}

function getChainById(chainId: number) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
}
