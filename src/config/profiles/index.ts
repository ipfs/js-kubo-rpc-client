import { createApply } from './apply.js'
import type { HTTPRPCOptions } from '../../index.js'
import type { HTTPRPCClient } from '../../lib/core.js'
import type { Config } from '../index.js'

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
