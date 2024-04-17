import { createLs } from './ls.js'
import { createPeers } from './peers.js'
import { createPublish } from './publish.js'
import { createSubscribe } from './subscribe.js'
import { SubscriptionTracker } from './subscription-tracker.js'
import { createUnsubscribe } from './unsubscribe.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { EventHandler, PeerId, Message } from '@libp2p/interface'

export interface PubSubAPI {
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
  subscribe(topic: string, handler: EventHandler<Message>, options?: PubSubSubscribeOptions): Promise<void>

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
  unsubscribe(topic: string, handler?: EventHandler<Message>, options?: HTTPRPCOptions): Promise<void>

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
  publish(topic: string, data: Uint8Array, options?: HTTPRPCOptions): Promise<void>

  /**
   * Returns the list of subscriptions the peer is subscribed to
   */
  ls(options?: HTTPRPCOptions): Promise<string[]>

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
  peers(topic: string, options?: HTTPRPCOptions): Promise<PeerId[]>

  setMaxListeners?(max: number): void
}

export interface PubSubSubscribeOptions extends HTTPRPCOptions {
  /**
   * A callback to receive an error if one occurs during processing
   * subscription messages. Only supported by ipfs-http-client.
   */
  onError?(err: Error): void

  discover?: boolean
}

export interface PubsubApiErrorHandlerFn {
  (err: Error, fatal: boolean, msg?: Message): void
}

export function createPubsub (client: HTTPRPCClient): PubSubAPI {
  const subscriptionTracker = new SubscriptionTracker()

  return {
    ls: createLs(client),
    peers: createPeers(client),
    publish: createPublish(client),
    subscribe: createSubscribe(client, subscriptionTracker),
    unsubscribe: createUnsubscribe(client, subscriptionTracker)
  }
}
