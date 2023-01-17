import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import type { StatResult } from './index.js'

export function createStat (client: Client) {
  async function stat (options?: ClientOptions): Promise<StatResult> {
    const res = await client.post('repo/stat', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })
    const data = await res.json()

    return {
      numObjects: BigInt(data.NumObjects),
      repoSize: BigInt(data.RepoSize),
      repoPath: data.RepoPath,
      version: data.Version,
      storageMax: BigInt(data.StorageMax)
    }
  }

  return stat
}
