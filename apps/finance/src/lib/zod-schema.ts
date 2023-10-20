import { isAddress, isHash } from 'viem'
import { z } from 'zod'

export function address() {
  return z.string().refine(isAddress)
}

export function hash() {
  return z.string().refine(isHash)
}
