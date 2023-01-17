import { createCancel } from './cancel.js'
import { createState } from './state.js'
import { createSubs } from './subs.js'
import type { ClientOptions } from '../../index.js'
import type { Client } from '../../lib/core.js'

export function createPubsub (client: Client): NamePubsubAPI {
  return {
    cancel: createCancel(client),
    state: createState(client),
    subs: createSubs(client)
  }
}

export interface NamePubsubAPI {
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
  cancel: (name: string, options?: ClientOptions) => Promise<PubsubCancelResult>

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
  state: (options?: ClientOptions) => Promise<PubsubStateResult>

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
  subs: (options?: ClientOptions) => Promise<string[]>
}

export interface PubsubCancelResult {
  canceled: boolean
}

export interface PubsubStateResult {
  enabled: boolean
}
