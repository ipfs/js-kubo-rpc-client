/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { getDescribe, getIt } from '../utils/mocha.js'
import { getTopic, waitForTopicPeer } from './utils.js'
import type { IDResult, KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testPeers (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.peers', function () {
    this.timeout(80 * 1000)

    let ipfs1: KuboRPCClient
    let ipfs2: KuboRPCClient
    let ipfs3: KuboRPCClient
    let subscribedTopics: string[] = []
    let ipfs2Id: IDResult
    let ipfs3Id: IDResult

    let daemon1: KuboNode
    let daemon2: KuboNode
    let daemon3: KuboNode

    before(async function () {
      daemon1 = (await factory.spawn())
      ipfs1 = daemon1.api
      daemon2 = (await factory.spawn())
      ipfs2 = daemon2.api
      daemon3 = (await factory.spawn())
      ipfs3 = daemon3.api

      ipfs2Id = await ipfs2.id()
      ipfs3Id = await ipfs3.id()

      const ipfs2Addr = ipfs2Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')
      const ipfs3Addr = ipfs3Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')

      if (ipfs2Addr == null || ipfs3Addr == null) {
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
        await Promise.all(nodes.map(async ipfs => ipfs.pubsub.unsubscribe(topic)))
      }
      subscribedTopics = []
      await delay(100)
    })

    after(async function () {
      await factory.clean()
    })

    it('should not error when not subscribed to a topic', async () => {
      const topic = getTopic()
      const peers = await ipfs1.pubsub.peers(topic)
      expect(peers).to.exist()
      expect(peers).to.be.empty()
    })

    it('should not return extra peers', async () => {
      const sub1 = (): void => {}
      const sub2 = (): void => {}
      const sub3 = (): void => {}

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
      const sub1 = (): void => {}
      const sub2 = (): void => {}
      const sub3 = (): void => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForTopicPeer(topic, daemon2, daemon1, { maxRetryTime: 30000 })
    })

    it('should return peers for a topic - multiple peers', async () => {
      const sub1 = (): void => {}
      const sub2 = (): void => {}
      const sub3 = (): void => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForTopicPeer(topic, daemon2, daemon1, { maxRetryTime: 30000 })
      await waitForTopicPeer(topic, daemon3, daemon1, { maxRetryTime: 30000 })
    })
  })
}
