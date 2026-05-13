import { createPatch } from './patch/index.ts'
import type { Codecs } from '../index.ts'
import type { ObjectPatchAPI } from './patch/index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'
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
