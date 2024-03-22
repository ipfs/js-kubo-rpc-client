import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'
import type { ClientOptions } from '../../../index.js'
import type { Client } from '../../../lib/core.js'

export function createService (client: Client): PinRemoteServiceAPI {
  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client)
  }
}

export interface PinRemoteServiceAPI {
  /**
   * Registers remote pinning service with a given name. Errors if service
   * with the given name is already registered.
   */
  add: (name: string, credentials: Credentials & ClientOptions) => Promise<void>

  /**
   * Unregisters remote pinning service with a given name. If service with such
   * name isn't registered this is a noop.
   */
  rm: (name: string, options?: ClientOptions) => Promise<void>

  /**
   * List registered remote pinning services.
   */
  ls: ((options: { stat?: true } & ClientOptions) => Promise<RemotePinServiceWithStat | RemotePinService[]>)
}

export interface Credentials {
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
  stat: Stat
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
