import type { PubSubAPI } from './index.ts'
import type { SubscriptionTracker } from './subscription-tracker.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createUnsubscribe (client: HTTPRPCClient, subsTracker: SubscriptionTracker): PubSubAPI['unsubscribe'] {
  return async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
}
