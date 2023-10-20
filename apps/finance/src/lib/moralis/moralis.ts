import { Redis } from 'ioredis'
import { ZodSchema, z } from 'zod'
import { CacheLayer } from '../cache-layer'

// #region Moralis SDK
type Config = {
  apiKey: string
  cache?: CacheLayer
}

export class Moralis {
  baseUrl = 'https://deep-index.moralis.io'

  constructor(public readonly config: Config) {}

  get cache() {
    return this.config.cache
  }

  async fetch<T extends ZodSchema>(args: {
    url: URL
    schema: T
  }): Promise<z.infer<T>> {
    const cached = await this.cache?.beforeFetch(args.url, args.schema)
    if (cached != null) return cached
    // --

    const res = await fetch(args.url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': this.config.apiKey,
      },
    })
    const json = await res.json()

    // --
    await this.cache?.afterFetch(args.url, json)
    // --

    return args.schema.parse(json)
  }

  createUrl(path: `/api/v${number}.${number}/${string}`) {
    return new URL(path, this.baseUrl)
  }
}
// #endregion

const envSchema = z.object({
  MORALIS_API_KEY: z.string(),
})

export function getMoralis() {
  return new Moralis({
    apiKey: envSchema.parse(process.env).MORALIS_API_KEY,
    cache: new CacheLayer({
      appPrefix: 'moralis',
      storage: new Redis(),
      aggressive: true,
    }),
  })
}
