import { reverse, zip } from 'lodash'
import { formatUnits } from 'viem'
import { arbitrum } from 'viem/chains'
import { getBalancesOnBlocks } from '~/app/yield/[account]/_lib/get-balances-on-block'
import { getLast7DaysBlocks } from '~/app/yield/[account]/_lib/get-last-7-days-block'
import { getArbitrumClient } from '~/lib/viem/get-public-client'

const chain = arbitrum
const publicClient = getArbitrumClient()
const account = '0x'
const token = '0x'

const blocks = reverse(await getLast7DaysBlocks(chain.id))
const balances = await getBalancesOnBlocks({
  account,
  blockNumbers: blocks.map((b) => b.block),
  publicClient,
  token,
})
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
      earnedForADay: earnedForADay ? formatUnits(earnedForADay, 6) : '-',
      apr: (() => {
        if (earnedForADay == null || previous == null) return '-'
        const apr = Number(earnedForADay * 365n) / Number(previous[0]!)
        return apr.toLocaleString(undefined, {
          style: 'percent',
          maximumFractionDigits: 10,
        })
      })(),
    }
  })
}
// #endregion
