import { createProvideStat } from './stat.ts'
import type { ProvideStatOptions, ProvideStats } from './types.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export type { ProvideStatOptions, ProvideStats } from './types.ts'

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
