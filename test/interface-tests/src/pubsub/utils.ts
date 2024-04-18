import { logger } from '@libp2p/logger'
import { peerIdFromString } from '@libp2p/peer-id'
import delay from 'delay'
import { nanoid } from 'nanoid'
import pRetry from 'p-retry'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import type { KuboController } from '..'
import type { KuboRPCClient } from '../../../../src'
import type { PubSubSubscribeOptions } from '../../../../src/pubsub'
import type { Message } from '@libp2p/interface'
import type { Options as RetryOptions } from 'p-retry'

const log = logger('js-kubo-rpc-client:pubsub:utils:test')

export async function waitForPeers (ipfs: KuboRPCClient, topic: string, peersToWait: string[], waitForMs: number): Promise<void> {
  const start = Date.now()

  while (true) {
    const peers = await ipfs.pubsub.peers(topic)
    const everyPeerFound = peersToWait.map(p => peerIdFromString(p)).every(p => peers.includes(p))

    if (everyPeerFound) {
      return
    }

    if (Date.now() > start + waitForMs) {
      throw new Error(`Timed out waiting for peers to be subscribed to "${topic}"`)
    }

    await delay(10)
  }
}

const retryOptions: RetryOptions = {
  retries: 5,
  onFailedAttempt: async ({ attemptNumber }) => {
    await delay(1000 * attemptNumber)
  },
  maxRetryTime: 10000
}

/**
 * This function does not wait properly when waiting for itself as a peer
 */
export const waitForTopicPeer = async (topic: string, peer: KuboController['peer'], daemon: KuboController, rOpts: RetryOptions = {}): Promise<void> => {
  return pRetry(async () => {
    log(`waitForTopicPeer(${topic}): waiting for topic ${topic} from peer ${peer.id.toString()} on ${daemon.peer.id.toString()}`)
    const peers = await daemon.api.pubsub.peers(topic)
    const peerStrings = peers.map(p => p.toString())
    log(`waitForTopicPeer(${topic}): peers(${peers.length}): ${peerStrings}`)
    if (!peerStrings.includes(peer.id.toString())) {
      throw new Error(`Could not find peer ${peer.id}`)
    } else {
      log(`waitForTopicPeer(${topic}): Peer found`)
    }
  }, {
    ...retryOptions,
    ...rOpts
  })
}

export function getTopic (): string {
  return 'pubsub-tests-' + nanoid()
}

interface SubscriptionTestObjectArgs {
  subscriber: KuboController
  publisher: KuboController
  topic: string
  timeout: number
  options?: PubSubSubscribeOptions
  subscriptionListener?(msg: Message): Promise<void>
}

interface SubscriptionTestObject {
  /**
   * get all the current messages
   */
  getMessages(): Message[]

  /**
   *
   * wait for count(default=1) messages on the given topic
   */
  waitForMessages(count?: number, pRetryOptions?: RetryOptions): Promise<Message[]>

  /**
   * publish a message on the given topic
   */
  publishMessage(data: Uint8Array): Promise<void>

  /**
   * unsubscribe from the given topic
   */
  unsubscribe(): Promise<void>
}

export async function getSubscriptionTestObject ({ subscriber, subscriptionListener, publisher, topic, options, timeout }: SubscriptionTestObjectArgs): Promise<SubscriptionTestObject> {
  const allMessages: Message[] = []
  timeout = timeout ?? 10000
  log(`${topic}: ${subscriber.peer.id.toString()} is subscribing`)
  const subscriptionHandler = (msg: Message): void => {
    // log(`${topic}: received message`)
    if (msg.type !== 'signed') {
      throw new Error('Message was unsigned')
    }
    log(`${topic}: ${subscriber.peer.id.toString()} message content: '${uint8ArrayToString(msg.data)}'`)
    allMessages.push(msg)

    void subscriptionListener?.(msg)
  }

  await subscriber.api.pubsub.subscribe(topic, subscriptionHandler, options)
  await delay(100)

  return {
    getMessages: () => allMessages,
    waitForMessages: async (count = 1, pRetryOpts = {}) => {
      await pRetry(async () => {
        if (allMessages.length < count) {
          throw new Error(`Wanting ${count} messages but only have ${allMessages.length}`)
        }
      }, {
        retries: 5,
        onFailedAttempt: async ({ attemptNumber }) => {
          await delay(1000 * attemptNumber)
        },
        maxRetryTime: timeout,
        ...pRetryOpts
      })
      return allMessages
    },
    publishMessage: async (data) => {
      try {
        log(`${topic}: publishing message '${uint8ArrayToString(data)}'`)
        await publisher.api.pubsub.publish(topic, data)
        log(`${topic}: message published.`)
      } catch (err) {
        log(`${topic}: Error publishing message from ${publisher.peer.id.toString()}`, err)
      }
    },
    unsubscribe: async () => {
      await subscriber.api.pubsub.unsubscribe(topic, subscriptionHandler)
    }
  }
}
