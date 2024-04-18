/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { getTopic } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testLs (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.ls', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient
    let subscribedTopics: string[] = []
    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    afterEach(async function () {
      for (let i = 0; i < subscribedTopics.length; i++) {
        await ipfs.pubsub.unsubscribe(subscribedTopics[i])
      }
      subscribedTopics = []
      await delay(100)
    })

    after(async function () {
      await factory.clean()
    })

    it('should return an empty list when no topics are subscribed', async () => {
      const topics = await ipfs.pubsub.ls()
      expect(topics.length).to.equal(0)
    })

    it('should return a list with 1 subscribed topic', async () => {
      const sub1 = (): void => {}
      const topic = getTopic()
      subscribedTopics = [topic]

      await ipfs.pubsub.subscribe(topic, sub1)
      const topics = await ipfs.pubsub.ls()
      expect(topics).to.be.eql([topic])
    })

    it('should return a list with 3 subscribed topics', async () => {
      const topics = [{
        name: 'one',
        handler () {}
      }, {
        name: 'two',
        handler () {}
      }, {
        name: 'three',
        handler () {}
      }]

      subscribedTopics = topics.map(t => t.name)

      for (let i = 0; i < topics.length; i++) {
        await ipfs.pubsub.subscribe(topics[i].name, topics[i].handler)
      }

      const list = await ipfs.pubsub.ls()
      expect(list.sort()).to.eql(topics.map(t => t.name).sort())
    })
  })
}
