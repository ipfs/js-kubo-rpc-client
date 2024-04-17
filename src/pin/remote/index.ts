import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRmAll } from './rm-all.js'
import { createRm } from './rm.js'
import { createService } from './service/index.js'
import type { PinRemoteServiceAPI } from './service/index.js'
import type { HTTPRPCOptions } from '../../index.js'
import type { HTTPRPCClient } from '../../lib/core.js'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { CID } from 'multiformats/cid'

export interface PinRemoteAPI {
  /**
   * API for configuring remote pinning services.
   */
  service: PinRemoteServiceAPI

  /**
   * Pin a content with a given CID to a remote pinning service.
   */
  add(cid: CID, options: PinRemoteAddOptions): Promise<RemotePin>

  /**
   * Returns a list of matching pins on the remote pinning service.
   */
  ls(query: RemotePinQuery): AsyncIterable<RemotePin>

  /**
   * Removes a single pin object matching query allowing it to be garbage
   * collected (if needed). Will error if multiple pins match provided
   * query. To remove all matches use `rmAll` instead.
   */
  rm(query: RemotePinQuery): Promise<void>

  /**
   * Removes all pin object that match given query allowing them to be garbage
   * collected if needed.
   */
  rmAll(query: RemotePinQuery): Promise<void>
}

export interface PinRemoteAddOptions extends RemoteServiceOptions {
  /**
   * Optional name for pinned data; can be used for lookups later (max 255
   * characters)
   */
  name?: string

  /**
   * Optional list of multiaddrs known to provide the data (max 20).
   */
  origins?: Multiaddr[]

  /**
   * If true, will add to the queue on the remote service and return
   * immediately. If false or omitted will wait until pinned on the
   * remote service.
   */
  background?: boolean
}

/**
 * Reperesents query for matching pin objects.
 */
export interface RemotePinQuery extends RemoteServiceOptions {
  /**
   * If provided, will only include pin objects that have a CID from the given
   * set.
   */
  cid?: CID[]
  /**
   * If passed, will only include pin objects with names that have this name
   * (case-sensitive, exact match).
   */
  name?: string

  /**
   * Return pin objects for pins that have one of the specified status values.
   * If omitted treated as ["pinned"]
   */
  status?: RemotePinStatus[]

  all?: boolean
}

export interface RemoteServiceOptions extends HTTPRPCOptions {
  /**
   * Name of the remote pinning service to use.
   */
  service?: string
}

export interface RemotePin {
  status: RemotePinStatus
  cid: CID
  name: string
}

export type RemotePinStatus =
  | 'queued'
  | 'pinning'
  | 'pinned'
  | 'failed'

export function createRemote (client: HTTPRPCClient): PinRemoteAPI {
  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client),
    rmAll: createRmAll(client),
    service: createService(client)
  }
}
