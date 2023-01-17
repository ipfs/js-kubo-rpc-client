import { createData } from './data.js'
import { createGet } from './get.js'
import { createLinks } from './links.js'
import { createNew } from './new.js'
import { createPut } from './put.js'
import { createStat } from './stat.js'
import { createPatch, ObjectPatchAPI } from './patch/index.js'
import type { ClientOptions, Multicodecs, PreloadOptions } from '../index.js'
import type { PBNode, PBLink } from '@ipld/dag-pb'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'

export function createObject (codecs: Multicodecs, client: Client) {
  return {
    data: createData(client),
    get: createGet(client),
    links: createLinks(client),
    new: createNew(client),
    put: createPut(codecs, client),
    stat: createStat(client),
    patch: createPatch(client)
  }
}

export interface ObjectAPI {
  /**
   * @deprecated function will be removed in the future.
   */
  new: (options?: NewObjectOptions) => Promise<CID>
  /**
   * @deprecated function will be removed in the future.
   */
  put: (obj: PBNode, options?: PutOptions) => Promise<CID>
  /**
   * @deprecated function will be removed in the future.
   */
  get: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<PBNode>
  /**
   * @deprecated function will be removed in the future.
   */
  data: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<Uint8Array>
  /**
   * @deprecated function will be removed in the future.
   */
  links: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<PBLink[]>
  /**
   * @deprecated function will be removed in the future.
   */
  stat: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<StatResult>
  patch: ObjectPatchAPI
}

export interface NewObjectOptions extends ClientOptions, PreloadOptions {
  template?: 'unixfs-dir'
}

export interface StatResult {
  Hash: CID
  NumLinks: number
  BlockSize: number
  LinksSize: number
  DataSize: number
  CumulativeSize: number
}

export interface PutOptions extends ClientOptions, PreloadOptions {
  pin?: boolean
}
