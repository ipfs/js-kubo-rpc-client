import { createPut as createDagPut } from '../dag/put.js'
import type { Multicodecs } from '../index.js'
import type { PBNode } from '@ipld/dag-pb'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'
import type { PutOptions } from './index.js'

export function createPut (codecs: Multicodecs, client: Client) {
  const dagPut = createDagPut(codecs, client)

  async function put (obj: PBNode, options?: PutOptions): Promise<CID> {
    return await dagPut(obj, {
      ...options,
      storeCodec: 'dag-pb',
      hashAlg: 'sha2-256'
    })
  }

  return put
}
