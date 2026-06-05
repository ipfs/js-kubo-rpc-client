import { createApply } from './apply.ts'
import type { HTTPRPCOptions } from '../../index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'
import type { Config } from '../index.ts'

export interface ProfilesApplyOptions extends HTTPRPCOptions {
  dryRun?: boolean
}
export interface ProfilesApplyResult {
  original: Config
  updated: Config
}

export interface ConfigProfilesAPI {
  /**
   * Apply a profile to the current config.  Note that restarting the node
   * will be necessary for any change to take effect.
   */
  apply(name: string, options?: ProfilesApplyOptions): Promise<ProfilesApplyResult>
}

export function createProfiles (client: HTTPRPCClient): ConfigProfilesAPI {
  return {
    apply: createApply(client)
  }
}
