import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { CID } from 'multiformats'
import type { PublishOptions, PublishResult } from './index.js'
import type { Client } from '../lib/core.js'

export function createPublish (client: Client) {
  async function publish (path: CID | string, options?: PublishOptions): Promise<PublishResult> {
    const res = await client.post('name/publish', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: `${path.toString()}`,
        ...options
      }),
      headers: options?.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }

  return publish
}
