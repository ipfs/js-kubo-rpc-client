import { createLs } from './ls.js'
import { createPeers } from './peers.js'
import { createPublish } from './publish.js'
import { createSubscribe } from './subscribe.js'
import { createUnsubscribe } from './unsubscribe.js'
import { SubscriptionTracker } from './subscription-tracker.js'
import type { ClientOptions } from '../index.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Message } from '@libp2p/interface-pubsub'
import type { EventHandler } from '@libp2p/interfaces/events'
import type { Client } from '../lib/core.js'

export function createPubsub (client: Client): PubsubAPI {
  const subscriptionTracker = new SubscriptionTracker()

  return {
    ls: createLs(client),
    peers: createPeers(client),
    publish: createPublish(client),
    subscribe: createSubscribe(client, subscriptionTracker),
    unsubscribe: createUnsubscribe(client, subscriptionTracker)
  }
}

export interface PubsubAPI {
  /**
   * Subscribe to a pubsub topic
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.data.toString())
   *
   * await ipfs.pubsub.subscribe(topic, receiveMsg)
   * console.log(`subscribed to ${topic}`)
   * ```
   */
  subscribe: (topic: string, handler: EventHandler<Message>, options?: SubscribeOptions) => Promise<void>

  /**
   * Unsubscribes from a pubsub topic
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.toString())
   *
   * await ipfs.pubsub.subscribe(topic, receiveMsg)
   * console.log(`subscribed to ${topic}`)
   *
   * await ipfs.pubsub.unsubscribe(topic, receiveMsg)
   * console.log(`unsubscribed from ${topic}`)
   *
   * // Or removing all listeners:
   *
   * const topic = 'fruit-of-the-day'
   * const receiveMsg = (msg) => console.log(msg.toString())
   * await ipfs.pubsub.subscribe(topic, receiveMsg);
   * // Will unsubscribe ALL handlers for the given topic
   * await ipfs.pubsub.unsubscribe(topic);
   * ```
   */
  unsubscribe: (topic: string, handler?: EventHandler<Message>, options?: ClientOptions) => Promise<void>

  /**
   * Publish a data message to a pubsub topic
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   * const msg = new TextEncoder().encode('banana')
   *
   * await ipfs.pubsub.publish(topic, msg)
   * // msg was broadcasted
   * console.log(`published to ${topic}`)
   * ```
   */
  publish: (topic: string, data: Uint8Array, options?: ClientOptions) => Promise<void>

  /**
   * Returns the list of subscriptions the peer is subscribed to
   */
  ls: (options?: ClientOptions) => Promise<string[]>

  /**
   * Returns the peers that are subscribed to one topic.
   *
   * @example
   * ```js
   * const topic = 'fruit-of-the-day'
   *
   * const peerIds = await ipfs.pubsub.peers(topic)
   * console.log(peerIds)
   * ```
   */
  peers: (topic: string, options?: ClientOptions) => Promise<PeerId[]>

  setMaxListeners?: (max: number) => void
}

export interface SubscribeOptions extends ClientOptions {
  /**
   * A callback to receive an error if one occurs during processing
   * subscription messages. Only supported by ipfs-http-client.
   */
  onError?: (err: Error) => void
}
