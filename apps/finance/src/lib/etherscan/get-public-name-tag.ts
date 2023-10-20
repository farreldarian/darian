import { load } from 'cheerio'
import { Address, Chain } from 'viem'

export async function getPublicNameTag(chain: Chain, account: Address) {
  const url = chain.blockExplorers?.default.url
  if (url == null) return null

  const res = await fetch(`${url}/address/${account}`)
  return extractNameTag(await res.text())
}

export function extractNameTag(text: string) {
  const matches = load(text)('a[href^="https://"] span.hash-tag').first().text()

  if (matches.length === 0) return null
  return matches
}
