import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { reverse, zip } from 'lodash'
import { formatUnits } from 'viem'
import { arbitrum } from 'viem/chains'
import { getBalancesOnBlocks } from '~/app/yield/[account]/_lib/get-balances-on-blocks'
import { getLastNDaysBlocks } from '~/app/yield/[account]/_lib/get-last-n-days-blocks'
import { getArbitrumClient } from '~/lib/viem/get-public-client'

const chain = arbitrum
const publicClient = getArbitrumClient()
const account = '0xbcebf81faad87ce9e1c630e2993734a20183e1d3'
// USDC.e
// const token = '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
// USDC
const token = '0x724dc807b04555b71ed48a6896b6F41593b8C637'

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

console.log('Daily Summary:')
const dailySummary = getDailySummary()
console.log(dailySummary)

console.log('Monthly Summary:')
console.log(getMonthlySummary(dailySummary))

// #region Helpers
function getDailySummary() {
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
      earned:
        earnedForADay == null
          ? new Decimal(0)
          : new Decimal(formatUnits(earnedForADay, 6)),
      earned_fmt: (() => {
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

function getMonthlySummary(dailySummary: ReturnType<typeof getDailySummary>) {
  const map = new Map<string, { earned: Decimal }>()
  for (const daily of dailySummary) {
    const key = format(daily.date, 'yyyy-MM')
    const data = map.get(key) ?? { earned: new Decimal(0) }

    data.earned = daily.earned.add(data.earned)

    map.set(key, data)
  }

  return Array.from(map.entries()).map(([date, data]) => {
    return { date, earned: data.earned.toString() }
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

process.exit(0)
