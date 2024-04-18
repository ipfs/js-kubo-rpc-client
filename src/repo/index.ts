import { createGc } from './gc.js'
import { createStat } from './stat.js'
import { createVersion } from './version.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { CID } from 'multiformats/cid'

export interface RepoAPI {
  /**
   * Perform garbage collection on the repo
   *
   * Any unpinned blocks will be deleted
   */
  gc(options?: RepoGCOptions): AsyncIterable<RepoGCResult>

  /**
   * Return stats about the repo
   */
  stat(options?: HTTPRPCOptions): Promise<RepoStatResult>

  /**
   * If the repo has been initialized, report the current version,
   * otherwise report the version that would be initialized
   */
  version(options?: HTTPRPCOptions): Promise<number>
}

export interface RepoGCOptions extends HTTPRPCOptions {
  quiet?: boolean
}

export interface RepoGCError {
  err: Error
  cid?: never
}

export interface RepoGCSuccess {
  err?: never
  cid: CID
}

export type RepoGCResult = RepoGCSuccess | RepoGCError

export interface RepoStatResult {
  numObjects: bigint
  repoPath: string
  repoSize: bigint
  version: string
  storageMax: bigint
}

export function createRepo (client: HTTPRPCClient): RepoAPI {
  return {
    gc: createGc(client),
    stat: createStat(client),
    version: createVersion(client)
  }
}
