import { startOfDay, startOfToday, subDays } from 'date-fns'
import { range } from 'lodash'
import {
  GetDateToBLockResponse,
  getDateToBlock,
} from '~/lib/moralis/get-date-to-block'
import { getMoralis } from '~/lib/moralis/moralis'

export async function getLast7DaysBlocks(chainId: number) {
  const blocks: GetDateToBLockResponse[] = []
  for await (const date of getLast7Days()) {
    const res = await getDateToBlock(getMoralis(), {
      date,
      chainId,
    })
    blocks.push(res)
  }
  return blocks
}

function getLast7Days() {
  const today = startOfToday()
  return [today, ...range(6).map((i) => startOfDay(subDays(today, i + 1)))]
}
