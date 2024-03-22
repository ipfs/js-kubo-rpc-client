import { createGc } from './gc.js'
import { createStat } from './stat.js'
import { createVersion } from './version.js'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createRepo (client: Client): RepoAPI {
  return {
    gc: createGc(client),
    stat: createStat(client),
    version: createVersion(client)
  }
}

export interface RepoAPI {
  /**
   * Perform garbage collection on the repo
   *
   * Any unpinned blocks will be deleted
   */
  gc: (options?: GCOptions) => AsyncIterable<GCResult>

  /**
   * Return stats about the repo
   */
  stat: (options?: ClientOptions) => Promise<StatResult>

  /**
   * If the repo has been initialized, report the current version,
   * otherwise report the version that would be initialized
   */
  version: (options?: ClientOptions) => Promise<number>
}

export interface GCOptions extends ClientOptions {
  quiet?: boolean
}

export interface GCError {
  err: Error
  cid?: never
}

export interface GCSuccess {
  err?: never
  cid: CID
}

export type GCResult = GCSuccess | GCError

export interface StatResult {
  numObjects: bigint
  repoPath: string
  repoSize: bigint
  version: string
  storageMax: bigint
}
