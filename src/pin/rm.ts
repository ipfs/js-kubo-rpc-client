import { createRmAll } from './rm-all.js'
import last from 'it-last'
import type { IPFSPath } from '../index.js'
import type { CID } from 'multiformats'
import type { RmOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createRm (client: Client) {
  const all = createRmAll(client)

  async function rm (path: IPFSPath, options?: RmOptions): Promise<CID> {
    // @ts-expect-error last can return undefined
    return await last(all([{
      path,
      ...options
    }], options))
  }

  return rm
}
