import type { ClientOptions, Message } from '../index.js'
import type { SubscriptionTracker } from './subscription-tracker.js'
import type { EventHandler } from '@libp2p/interfaces/events'
import type { Client } from '../lib/core.js'

export function createUnsubscribe (client: Client, subsTracker: SubscriptionTracker) {
  async function unsubscribe (topic: string, handler?: EventHandler<Message>, options?: ClientOptions): Promise<void> {
    subsTracker.unsubscribe(topic, handler)
  }
  return unsubscribe
}
