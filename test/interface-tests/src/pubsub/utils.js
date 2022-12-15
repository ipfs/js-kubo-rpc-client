import { nanoid } from 'nanoid'
import delay from 'delay'
import pRetry from 'p-retry'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

import { logger } from '@libp2p/logger'

const log = logger('js-kubo-rpc-client:pubsub:utils:test')

/**
 * @typedef {import('../../../../src/types').SubscribeMessage} SubscribeMessage
 */
/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} topic
 * @param {string[]} peersToWait
 * @param {number} waitForMs
 * @returns
 */
export async function waitForPeers (ipfs, topic, peersToWait, waitForMs) {
  const start = Date.now()

  while (true) {
    const peers = await ipfs.pubsub.peers(topic)
    const everyPeerFound = peersToWait.every(p => peers.includes(p))

    if (everyPeerFound) {
      return
    }

    if (Date.now() > start + waitForMs) {
      throw new Error(`Timed out waiting for peers to be subscribed to "${topic}"`)
    }

    await delay(10)
  }
}

const retryOptions = {
  retries: 5,
  onFailedAttempt: async ({ attemptNumber }) => {
    await delay(1000 * attemptNumber)
  },
  maxRetryTime: 10000
}

/**
 * This function does not wait properly when waiting for itself as a peer
 *
 * @param {string} topic
 * @param {import('ipfsd-ctl').Controller["peer"]} peer
 * @param {import('ipfsd-ctl').Controller} daemon
 * @param {Parameters<typeof pRetry>[1]} rOpts
 */
export const waitForTopicPeer = (topic, peer, daemon, rOpts = {}) => {
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
    retryOptions,
    ...rOpts
  })
}

export function getTopic () {
  return 'pubsub-tests-' + nanoid()
}

/**
 * @param {object} argObject
 * @param {import('ipfsd-ctl').Controller} argObject.subscriber
 * @param {import('ipfsd-ctl').Controller} argObject.publisher
 * @param {Parameters<import('ipfsd-ctl').Controller['api']['pubsub']['subscribe']>[0]} argObject.topic
 * @param {number} argObject.timeout
 * @param {Parameters<import('ipfsd-ctl').Controller['api']['pubsub']['subscribe']>[2]} [argObject.options]
 * @param {Parameters<import('ipfsd-ctl').Controller['api']['pubsub']['subscribe']>[1]} [argObject.subscriptionListener]
 * @returns {Promise<SubscriptionTestObject>}
 */
export async function getSubscriptionTestObject ({ subscriber, subscriptionListener, publisher, topic, options, timeout }) {
  /**
   * @type {SubscribeMessage[]}
   */
  const allMessages = []
  timeout = timeout ?? 10000
  log(`${topic}: ${subscriber.peer.id.toString()} is subscribing`)
  const subscriptionHandler = async (msg) => {
    // log(`${topic}: received message`)
    if (msg.type !== 'signed') {
      throw new Error('Message was unsigned')
    }
    log(`${topic}: ${subscriber.peer.id.toString()} message content: '${uint8ArrayToString(msg.data)}'`)
    allMessages.push(msg)
    if (subscriptionListener != null) {
      await subscriptionListener(msg)
    }
  }
  await subscriber.api.pubsub.subscribe(topic, subscriptionHandler, options)
  await delay(100)

  /**
   * @typedef SubscriptionTestObject
   * @property {() => SubscribeMessage[]} getMessages - get all the current messages
   * @property {(count: number, pRetryOptions: Parameters<typeof pRetry>[1]) => Promise<SubscribeMessage[]>} waitForMessages - wait for count(default=1) messages on the given topic
   * @property {(data: Uint8Array) => Promise<void>} publishMessage - publish a message on the given topic
   * @property {() => Promise<void>} unsubscribe - unsubscribe from the given topic
   */
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
    // }),
    publishMessage: async (data) => {
      try {
        log(`${topic}: publishing message '${uint8ArrayToString(data)}'`)
        await publisher.api.pubsub.publish(topic, data)
        log(`${topic}: message published.`)
      } catch (err) {
        log(`${topic}: Error publishing message from ${publisher.peer.id.toString()}`, err)
      }
    },
    unsubscribe: async () => await subscriber.api.pubsub.unsubscribe(topic, subscriptionHandler)
  }
}
