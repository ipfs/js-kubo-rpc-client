import { createProvideStat } from './stat.js'
import type { ProvideStatOptions, ProvideStats } from './types.js'
import type { HTTPRPCClient } from '../lib/core.js'

export type { ProvideStatOptions, ProvideStats } from './types.js'

export interface ProvideAPI {
  /**
   * Return statistics about the provider system
   */
  stat(options?: ProvideStatOptions): Promise<ProvideStats>
}

export function createProvide (client: HTTPRPCClient): ProvideAPI {
  return {
    stat: createProvideStat(client)
  }
}
