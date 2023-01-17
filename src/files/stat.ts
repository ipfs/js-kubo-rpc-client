import { CID } from 'multiformats/cid'
import { objectToCamelWithMetadata } from '../lib/object-to-camel-with-metadata.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { IPFSPath } from '../index.js'
import type { StatOptions, StatResult } from './index.js'

export function createStat (client: Client) {
  async function stat (path: IPFSPath, options?: StatOptions): Promise<StatResult> {
    const res = await client.post('files/stat', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    data.WithLocality = data.WithLocality ?? false
    return toCoreInterface(objectToCamelWithMetadata(data))
  }

  return stat
}

function toCoreInterface (entry: any) {
  entry.cid = CID.parse(entry.hash)
  delete entry.hash
  return entry
}
