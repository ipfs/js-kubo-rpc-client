import type { PubSubAPI } from './index.js'
import type { SubscriptionTracker } from './subscription-tracker.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createUnsubscribe (client: HTTPRPCClient, subsTracker: SubscriptionTracker): PubSubAPI['unsubscribe'] {
  return async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
}
