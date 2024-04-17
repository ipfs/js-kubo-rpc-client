import { createAddLink } from './add-link.js'
import { createRmLink } from './rm-link.js'
import type { HTTPRPCOptions } from '../../index.js'
import type { HTTPRPCClient } from '../../lib/core.js'
import type { PBLink as DAGLink } from '@ipld/dag-pb'
import type { CID } from 'multiformats/cid'

export interface ObjectPatchAPI {
  addLink(cid: CID, link: DAGLink, options?: HTTPRPCOptions): Promise<CID>
  rmLink(cid: CID, link: DAGLink | string, options?: HTTPRPCOptions): Promise<CID>
}

export function createPatch (client: HTTPRPCClient): ObjectPatchAPI {
  return {
    addLink: createAddLink(client),
    rmLink: createRmLink(client)
  }
}
