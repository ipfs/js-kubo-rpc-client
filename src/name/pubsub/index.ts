import { createCancel } from './cancel.ts'
import { createState } from './state.ts'
import { createSubs } from './subs.ts'
import type { HTTPRPCOptions } from '../../index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export interface NamePubsubCancelResult {
  canceled: boolean
}

export interface NamePubsubStateResult {
  enabled: boolean
}

export interface NamePubSubAPI {
  /**
   * Cancel a name subscription.
   *
   * @example
   * ```js
   * const name = 'QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm'
   * const result = await ipfs.name.pubsub.cancel(name)
   * console.log(result.canceled)
   * // Logs: true
   * ```
   */
  cancel(name: string, options?: HTTPRPCOptions): Promise<NamePubsubCancelResult>

  /**
   * Query the state of IPNS pubsub.
   *
   * @returns {Promise<{ enabled: boolean }>}
   * ```js
   * const result = await ipfs.name.pubsub.state()
   * console.log(result.enabled)
   * // Logs: true
   * ```
   */
  state(options?: HTTPRPCOptions): Promise<NamePubsubStateResult>

  /**
   * Show current name subscriptions.
   *
   * @example
   * ```js
   * const result = await ipfs.name.pubsub.subs()
   * console.log(result)
   * // Logs: ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
   * ```
   */
  subs(options?: HTTPRPCOptions): Promise<string[]>
}

export function createPubsub (client: HTTPRPCClient): NamePubSubAPI {
  return {
    cancel: createCancel(client),
    state: createState(client),
    subs: createSubs(client)
  }
}
