import { startOfDay, startOfToday, subDays } from 'date-fns'
import { range } from 'lodash'
import {
  GetDateToBLockResponse,
  getDateToBlock,
} from '~/lib/moralis/get-date-to-block'
import { getMoralis } from '~/lib/moralis/moralis'

export async function getLastNDaysBlocks(chainId: number, n = 7) {
  const blocks: GetDateToBLockResponse[] = []
  for await (const date of getLastNDays(n)) {
    const res = await getDateToBlock(getMoralis(), {
      date,
      chainId,
    })
    blocks.push(res)
  }
  return blocks
}

function getLastNDays(n: number) {
  const today = startOfToday()
  return [today, ...range(n - 1).map((i) => startOfDay(subDays(today, i + 1)))]
}
