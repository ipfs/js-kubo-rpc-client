import { nanoid } from 'nanoid'
import delay from 'delay'
import pRetry from 'p-retry'

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
 * @param {string} topic
 * @param {import('ipfsd-ctl').Controller["peer"]} peer
 * @param {import('ipfsd-ctl').Controller} daemon
 * @param {Parameters<typeof pRetry>[1]} rOpts
 */
export const waitForTopicPeer = (topic, peer, daemon, rOpts = {}) => {
  return pRetry(async () => {
    // console.log(`waiting for topic ${topic} from peer ${peer.id.toString()} on ${daemon.peer.id.toString()}`)
    const peers = await daemon.api.pubsub.peers(topic)

    if (!peers.map(p => p.toString()).includes(peer.id.toString())) {
      throw new Error(`Could not find peer ${peer.id}`)
    } else {
      // console.log(`Peer found for topic ${topic}`)
    }
  }, {
    retryOptions,
    ...rOpts
  })
}

export function getTopic () {
  return 'pubsub-tests-' + nanoid()
}
