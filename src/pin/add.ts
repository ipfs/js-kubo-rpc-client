import { createAddAll } from './add-all.js'
import last from 'it-last'
import type { CID } from 'multiformats'
import type { AddOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createAdd (client: Client) {
  const all = createAddAll(client)

  async function add (path: string | CID, options?: AddOptions): Promise<CID> {
    // @ts-expect-error last can return undefined
    return await last(all([{
      path,
      ...options
    }], options))
  }

  return add
}
