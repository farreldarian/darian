import { createEnv } from '@t3-oss/env-core'
import { createPublicClient, http } from 'viem'
import { arbitrum } from 'viem/chains'
import { z } from 'zod'

export function getArbitrumClient() {
  const env = getEnv()
  return createPublicClient({
    transport: http(
      arbitrum.rpcUrls.alchemy.http[0] + `/${env.ALCHEMY_API_KEY}`
    ),
  })
}

function getEnv() {
  return createEnv({
    server: {
      ALCHEMY_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })
}
