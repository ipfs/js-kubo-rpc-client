import { createPatch, type ObjectPatchAPI } from './patch/index.js'
import type { Codecs } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { CID } from 'multiformats/cid'

export interface StatResult {
  Hash: CID
  NumLinks: number
  BlockSize: number
  LinksSize: number
  DataSize: number
  CumulativeSize: number
}

export interface ObjectAPI {
  patch: ObjectPatchAPI
}

export function createObject (client: HTTPRPCClient, codecs: Codecs): ObjectAPI {
  return {
    patch: createPatch(client)
  }
}
