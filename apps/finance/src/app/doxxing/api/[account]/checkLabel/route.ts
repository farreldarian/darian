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
import { db } from '~/server/db'

const DEFAULT_CHAIN_ID = mainnet.id
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

type CheckLabelCommand = {
  account: Address
  chainId: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { account: string } }
) {
  if (!isAddress(params.account))
    return new Response('Invalid address', { status: 400 })

  const command: CheckLabelCommand = {
    account: params.account,
    chainId: Number(extractChainParam(request) ?? DEFAULT_CHAIN_ID),
  }

  const lastCheck = await findLastCheck(command)
  if (isUpToDate(lastCheck)) {
    return new Response('Up to date', { status: 200 })
  }

  const chain = getChainById(command.chainId)
  if (!chain) {
    return new Response('Invalid chain', { status: 400 })
  }

  const tag = await getPublicNameTag(chain, command.account)
  if (tag) {
    await setTag(tag, command.account)
  }

  await upsertLastCheck(command)
  console.info(`Checked ${command.account}`)
  return new Response('OK', { status: 200 })
}

async function setTag(tag: string, account: Address) {
  await db.blockchainAccountLabel.create({
    data: { name: tag, address: account },
  })
  console.info(`Assigned ${tag} to ${account}`)
}

async function upsertLastCheck(command: CheckLabelCommand) {
  await db.blockchainAccountLabelLastCheck.upsert({
    where: {
      address_chainId: { address: command.account, chainId: command.chainId },
    },
    update: { checkedAt: new Date() },
    create: {
      address: command.account,
      chainId: command.chainId,
      checkedAt: new Date(),
    },
  })
}

function extractChainParam(request: NextRequest) {
  return request.nextUrl.searchParams.get('chain')
}

function findLastCheck(command: CheckLabelCommand) {
  return db.blockchainAccountLabelLastCheck.findUnique({
    where: {
      address_chainId: { address: command.account, chainId: command.chainId },
    },
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
