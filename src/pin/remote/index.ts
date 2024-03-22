import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'
import { createRmAll } from './rm-all.js'
import { createService, PinRemoteServiceAPI } from './service/index.js'
import type { ClientOptions } from '../../index.js'
import type { CID } from 'multiformats'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Client } from '../../lib/core.js'

export function createRemote (client: Client): PinRemoteAPI {
  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client),
    rmAll: createRmAll(client),
    service: createService(client)
  }
}

export interface PinRemoteAPI {
  /**
   * API for configuring remote pinning services.
   */
  service: PinRemoteServiceAPI

  /**
   * Pin a content with a given CID to a remote pinning service.
   */
  add: (cid: CID, options: AddOptions & ClientOptions) => Promise<Pin>

  /**
   * Returns a list of matching pins on the remote pinning service.
   */
  ls: (query: Query & ClientOptions) => AsyncIterable<Pin>

  /**
   * Removes a single pin object matching query allowing it to be garbage
   * collected (if needed). Will error if multiple pins match provided
   * query. To remove all matches use `rmAll` instead.
   */
  rm: (query: Query & ClientOptions) => Promise<void>

  /**
   * Removes all pin object that match given query allowing them to be garbage
   * collected if needed.
   */
  rmAll: (query: Query & ClientOptions) => Promise<void>
}

export interface AddOptions extends RemoteServiceOptions {
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
export interface Query extends RemoteServiceOptions {
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
  status?: Status[]
}

export interface RemoteServiceOptions {
  /**
   * Name of the remote pinning service to use.
   */
  service: string
}

export interface Pin {
  status: Status
  cid: CID
  name: string
}

export type Status =
  | 'queued'
  | 'pinning'
  | 'pinned'
  | 'failed'
