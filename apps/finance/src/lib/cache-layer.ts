import crypto from 'crypto'
import type { ZodSchema } from 'zod'

abstract class BaseCache {
  abstract get(key: string): Promise<object | string | null>
  abstract set(key: string, value: string): Promise<unknown>
}


type Config = {
  // The app prefix like `sp` in `sp:cache:...`
  appPrefix: string
  aggressive?: boolean
  storage: BaseCache
}

export class CacheLayer {
  constructor(public readonly config: Config) {}

  get storage() {
    return this.config.storage
  }

  async beforeFetch<T extends ZodSchema>(url: URL, schema: T) {
    if (!this.isAggresive()) return null
    const cached = await this.storage.get(this.getKey(url))
    if (cached == null) return null
    return schema.parse(
      typeof cached === 'string' ? JSON.parse(cached) : cached
    )
  }

  async afterFetch(url: URL, value: object) {
    if (!this.isAggresive()) return null
    await this.storage.set(this.getKey(url), JSON.stringify(value))
  }

  getKey(url: URL) {
    return `${this.config.appPrefix}:cache:${sha256(url.toString())}`
  }

  isAggresive() {
    return this.config.aggressive === true
  }
}

function sha256(data: string) {
  const hash = crypto.createHash('sha256')
  hash.update(data)
  return hash.digest('hex')
}
