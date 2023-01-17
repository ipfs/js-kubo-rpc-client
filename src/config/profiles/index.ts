import { createApply } from './apply.js'
import type { ClientOptions } from '../../index.js'
import type { Config } from '../index.js'
import type { Client } from '../../lib/core.js'

export function createProfiles (client: Client): ConfigProfilesAPI {
  return {
    apply: createApply(client)
  }
}

export interface ConfigProfilesAPI {
  /**
   * Apply a profile to the current config.  Note that restarting the node
   * will be necessary for any change to take effect.
   */
  apply: (name: string, options?: ProfilesApplyOptions) => Promise<ProfilesApplyResult>
}

export interface Profile {
  name: string
  description: string
}

export interface ProfilesApplyOptions extends ClientOptions {
  dryRun?: boolean
}
export interface ProfilesApplyResult {
  original: Config
  updated: Config
}
