import { CID } from 'multiformats/cid'
import { objectToCamelWithMetadata } from '../lib/object-to-camel-with-metadata.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { FilesAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createStat (client: HTTPRPCClient): FilesAPI['stat'] {
  return async function stat (path, options = {}) {
    const res = await client.post('files/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    data.WithLocality = data.WithLocality ?? false
    return toCoreInterface(objectToCamelWithMetadata(data))
  }
}

function toCoreInterface (entry: any): any {
  entry.cid = CID.parse(entry.hash)
  delete entry.hash
  return entry
}
