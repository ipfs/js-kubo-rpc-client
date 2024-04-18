import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'
import type { HTTPRPCOptions } from '../../../index.js'
import type { HTTPRPCClient } from '../../../lib/core.js'

export interface PinRemoteServiceAPI {
  /**
   * Registers remote pinning service with a given name. Errors if service
   * with the given name is already registered.
   */
  add(name: string, credentials: Credentials): Promise<void>

  /**
   * Unregisters remote pinning service with a given name. If service with such
   * name isn't registered this is a noop.
   */
  rm(name: string, options?: HTTPRPCOptions): Promise<void>

  /**
   * List registered remote pinning services.
   */
  ls: ((options: { stat: true } & HTTPRPCOptions) => Promise<RemotePinServiceWithStat[]>) & ((options?: HTTPRPCOptions) => Promise<RemotePinService[]>)
}

export interface Credentials extends HTTPRPCOptions {
  /**
   * Service endpoint
   */
  endpoint: URL
  /**
   * Service key
   */
  key: string
}

export interface RemotePinService {
  /**
   * Service name
   */
  service: string
  /**
   * Service endpoint URL
   */
  endpoint: URL
}

export interface RemotePinServiceWithStat extends RemotePinService {
  /**
   * Pin count on the remote service. It is fetched from the remote service and
   * is done only if `pinCount` option is used. Furthermore it may not be
   * present if service was unreachable.
   */
  stat?: Stat
}

export type Stat = ValidStat | InvalidStat

interface ValidStat {
  status: 'valid'
  pinCount: PinCount
}

interface InvalidStat {
  status: 'invalid'
  pinCount?: undefined
}

export interface PinCount {
  queued: number
  pinning: number
  pinned: number
  failed: number
}

export function createService (client: HTTPRPCClient): PinRemoteServiceAPI {
  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client)
  }
}
