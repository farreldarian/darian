import { reverse, zip } from 'lodash'
import { formatUnits } from 'viem'
import { arbitrum } from 'viem/chains'
import { getBalancesOnBlocks } from '~/app/yield/[account]/_lib/get-balances-on-blocks'
import { getLastNDaysBlocks } from '~/app/yield/[account]/_lib/get-last-n-days-blocks'
import { getArbitrumClient } from '~/lib/viem/get-public-client'

const chain = arbitrum
const publicClient = getArbitrumClient()
const account = '0x'
const token = '0x'

console.time('Fetching blocks')
const blocks = reverse(await getLastNDaysBlocks(chain.id, 93))
console.timeEnd('Fetching blocks')

console.time('Fetching balances')
const balances = await getBalancesOnBlocks({
  account,
  blockNumbers: blocks.map((b) => b.block),
  publicClient,
  token,
})
console.timeEnd('Fetching balances')

console.log('Summary:')
console.log(getSummary())

// #region Helpers
function getSummary() {
  if (balances.length !== blocks.length) throw new Error('length mismatch')
  return zip(balances, blocks).map(([balance, block], i, arr) => {
    balance = balance!
    block = block!
    const previous = arr.at(i - 1)
    const earnedForADay = (() => {
      if (previous == null) return null
      return balance - previous[0]!
    })()

    return {
      date: block.date,
      balance: formatUnits(balance, 6),
      earnedForADay: (() => {
        if (earnedForADay == null) return '-'
        const day = formatUnits(earnedForADay, 6)
        const month = formatUnits(earnedForADay * 31n, 6)
        const year = formatUnits(earnedForADay * 365n, 6)
        // prettier-ignore
        return `${day} (${compactUsd(month)} /month, ${compactUsd(year)} /year)`
      })(),
      apr: (() => {
        if (earnedForADay == null || previous == null) return '-'
        const apr = Number(earnedForADay * 365n) / Number(previous[0]!)
        return apr.toLocaleString(undefined, {
          style: 'percent',
          maximumFractionDigits: 2,
        })
      })(),
    }
  })
}

function compactUsd(value: string) {
  return Number(value).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
  })
}
// #endregion
