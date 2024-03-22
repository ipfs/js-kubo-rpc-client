import { createAddLink } from './add-link.js'
import { createAppendData } from './append-data.js'
import { createRmLink } from './rm-link.js'
import { createSetData } from './set-data.js'
import type { ClientOptions } from '../../index.js'
import type { PBLink as DAGLink } from '@ipld/dag-pb'
import type { CID } from 'multiformats'
import type { Client } from '../../lib/core.js'

export function createPatch (client: Client): ObjectPatchAPI {
  return {
    addLink: createAddLink(client),
    appendData: createAppendData(client),
    rmLink: createRmLink(client),
    setData: createSetData(client)
  }
}

export interface ObjectPatchAPI {
  /**
   * @deprecated function will be removed in the future.
   */
  addLink: (cid: CID, link: DAGLink, options?: ClientOptions) => Promise<CID>
  /**
   * @deprecated function will be removed in the future.
   */
  rmLink: (cid: CID, link: DAGLink | string, options?: ClientOptions) => Promise<CID>
  /**
   * @deprecated function will be removed in the future.
   */
  appendData: (cid: CID, data: Uint8Array, options?: ClientOptions) => Promise<CID>
  /**
   * @deprecated function will be removed in the future.
   */
  setData: (cid: CID, data: Uint8Array, options?: ClientOptions) => Promise<CID>
}
