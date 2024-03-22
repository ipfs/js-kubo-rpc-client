import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { RenameKeyResult } from './index.js'

export function createRename (client: Client) {
  async function rename (oldName: string, newName: string, options?: ClientOptions): Promise<RenameKeyResult> {
    const res = await client.post('key/rename', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: [
          oldName,
          newName
        ],
        ...options
      }),
      headers: options?.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }

  return rename
}
