/* eslint-env mocha */

import { getTopic, waitForTopicPeer } from './utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import delay from 'delay'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testPeers (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.peers', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs1
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs2
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs3
    /** @type {string[]} */
    let subscribedTopics = []
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs2Id
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs3Id

    /** @type {import('ipfsd-ctl').Controller} */
    let daemon1
    /** @type {import('ipfsd-ctl').Controller} */
    let daemon2
    /** @type {import('ipfsd-ctl').Controller} */
    let daemon3

    before(async function () {
      daemon1 = (await factory.spawn({ ipfsOptions }))
      ipfs1 = daemon1.api
      // webworkers are not dialable because webrtc is not available
      daemon2 = (await factory.spawn({ type: 'go', ipfsOptions }))
      ipfs2 = daemon2.api
      daemon3 = (await factory.spawn({ type: 'go', ipfsOptions }))
      ipfs3 = daemon3.api

      ipfs2Id = await ipfs2.id()
      ipfs3Id = await ipfs3.id()

      const ipfs2Addr = ipfs2Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')
      const ipfs3Addr = ipfs3Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')

      if (!ipfs2Addr || !ipfs3Addr) {
        throw new Error('Could not find addrs')
      }

      await ipfs1.swarm.connect(ipfs2Addr)
      await ipfs1.swarm.connect(ipfs3Addr)
      await ipfs2.swarm.connect(ipfs3Addr)
    })

    afterEach(async function () {
      const nodes = [ipfs1, ipfs2, ipfs3]
      for (let i = 0; i < subscribedTopics.length; i++) {
        const topic = subscribedTopics[i]
        await Promise.all(nodes.map(ipfs => ipfs.pubsub.unsubscribe(topic)))
      }
      subscribedTopics = []
      await delay(100)
    })

    after(async function () { return await factory.clean() })

    it('should not error when not subscribed to a topic', async () => {
      const topic = getTopic()
      const peers = await ipfs1.pubsub.peers(topic)
      expect(peers).to.exist()
      expect(peers).to.be.empty()
    })

    it('should not return extra peers', async () => {
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}

      const topic = getTopic()
      const topicOther = topic + 'different topic'

      subscribedTopics = [topic, topicOther]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topicOther, sub2)
      await ipfs3.pubsub.subscribe(topicOther, sub3)

      const peers = await ipfs1.pubsub.peers(topic)
      expect(peers).to.be.empty()
    })

    it('should return peers for a topic - one peer', async () => {
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForTopicPeer(topic, daemon2.peer, daemon1, { maxRetryTime: 30000 })
    })

    it('should return peers for a topic - multiple peers', async () => {
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForTopicPeer(topic, daemon2.peer, daemon1, { maxRetryTime: 30000 })
      await waitForTopicPeer(topic, daemon3.peer, daemon1, { maxRetryTime: 30000 })
    })
  })
}
