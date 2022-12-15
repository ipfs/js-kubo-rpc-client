/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { nanoid } from 'nanoid'
import { getTopic, getSubscriptionTestObject } from './utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isNode } from 'ipfs-utils/src/env.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import sinon from 'sinon'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { isPeerId } from '@libp2p/interface-peer-id'
import { logger } from '@libp2p/logger'
const log = logger('js-kubo-rpc-client:pubsub:subscribe:test')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {import('../../../../src/types').SubscribeMessage} SubscribeMessage
 */

/**
 *
 * @param {import('ipfsd-ctl').Controller} publisher
 * @param {string} topic
 * @param {SubscribeMessage} msg
 * @param {Uint8Array} data
 * @returns {void}
 */
const validateSubscriptionMessage = (publisher, topic, msg, data) => {
  expect(uint8ArrayEquals(data, msg.data)).to.be.true()
  expect(msg).to.have.property('sequenceNumber')
  expect(msg.sequenceNumber).to.be.a('bigint')
  expect(msg).to.have.property('topic', topic)
  expect(isPeerId(msg.from)).to.be.true()
  expect(msg.from.toString()).to.equal(publisher.peer.id.toString())
}

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testSubscribe (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.subscribe', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs1
    /** @type {import('ipfsd-ctl').Controller} */
    let daemon1
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs2
    /** @type {import('ipfsd-ctl').Controller} */
    let daemon2
    /** @type {string} */
    let topic
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs1Id
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs2Id

    beforeEach(async function () {
      log('beforeEach start')
      daemon1 = await factory.spawn({ ipfsOptions, test: true, args: ['--enable-pubsub-experiment'] })
      ipfs1 = daemon1.api

      daemon2 = await factory.spawn({ ipfsOptions, test: true, args: ['--enable-pubsub-experiment'] })
      ipfs2 = daemon2.api

      ipfs1Id = await ipfs1.id()
      ipfs2Id = await ipfs2.id()
      await ipfs1.swarm.connect(daemon2.peer.addresses[0])
      await ipfs2.swarm.connect(daemon1.peer.addresses[0])

      const peers = await Promise.all([
        ipfs1.swarm.peers(),
        ipfs2.swarm.peers()
      ])

      expect(peers[0].map((p) => p.peer.toString())).to.include(daemon2.peer.id.toString())
      expect(peers[1].map((p) => p.peer.toString())).to.include(daemon1.peer.id.toString())
      topic = getTopic()
      log('beforeEach done')
    })

    afterEach(async function () {
      log('afterEach start')

      await daemon1.api.pubsub.unsubscribe()
      await daemon2.api.pubsub.unsubscribe()
      await factory.clean()

      log('afterEach done')
    })

    describe('single node', function () {
      it('should subscribe to one topic', async () => {
        const data = uint8ArrayFromString('hi')

        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon1,
          topic,
          timeout: 5000
        })

        await subscriptionTestObj.publishMessage(data)
        const [msg] = await subscriptionTestObj.waitForMessages()

        validateSubscriptionMessage(daemon1, topic, msg, data)
        await subscriptionTestObj.unsubscribe()
      })

      it('should subscribe to one topic with options', async () => {
        const data = uint8ArrayFromString('hi')

        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon1,
          topic,
          timeout: 5000,
          options: {}
        })

        await subscriptionTestObj.publishMessage(data)
        const [msg] = await subscriptionTestObj.waitForMessages()

        validateSubscriptionMessage(daemon1, topic, msg, data)
        await subscriptionTestObj.unsubscribe()
      })

      it('should subscribe to topic multiple times with different handlers', async () => {
        const expectedString = 'hello'
        const data = uint8ArrayFromString(expectedString)
        const stub1 = sinon.stub()
        const stub2 = sinon.stub()
        const subscriptionTestObj1 = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon1,
          topic,
          subscriptionListener: stub1,
          timeout: 5000
        })
        const subscriptionTestObj2 = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon1,
          topic,
          subscriptionListener: stub2,
          timeout: 5000
        })

        expect(stub1).to.have.property('callCount', 0)
        expect(stub2).to.have.property('callCount', 0)
        await subscriptionTestObj1.publishMessage(data)

        const [msg1] = await subscriptionTestObj1.waitForMessages()
        const [msg2] = await subscriptionTestObj2.waitForMessages()

        validateSubscriptionMessage(daemon1, topic, msg1, data)
        validateSubscriptionMessage(daemon1, topic, msg2, data)

        expect(stub1).to.have.property('callCount', 1)
        expect(stub2).to.have.property('callCount', 1)
        await subscriptionTestObj1.unsubscribe()
        await subscriptionTestObj2.unsubscribe()
      })

      it('should allow discover option to be passed', async () => {
        const data = uint8ArrayFromString('hi')

        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon1,
          topic,
          timeout: 5000,
          options: { discover: true }
        })

        await subscriptionTestObj.publishMessage(data)
        const [msg] = await subscriptionTestObj.waitForMessages()

        validateSubscriptionMessage(daemon1, topic, msg, data)
        await subscriptionTestObj.unsubscribe()
      })
    })

    describe('multiple connected nodes', () => {
      this.timeout(120 * 1000)
      it('should receive messages from a different node with floodsub', async function () {
        if (!isNode) {
          return this.skip()
        }
        const expectedString = 'should receive messages from a different node with floodsub'
        const data = uint8ArrayFromString(expectedString)
        const topic = `floodsub-${nanoid()}`
        const daemon1 = await factory.spawn({
          ipfsOptions: {
            config: {
              Pubsub: {
                Router: 'floodsub'
              }
            }
          }
        })
        const ipfs1 = daemon1.api
        const daemon2 = await factory.spawn({
          ipfsOptions: {
            config: {
              Pubsub: {
                Router: 'floodsub'
              }
            }
          }
        })
        const ipfs2 = daemon2.api
        const ipfs2Id = await ipfs2.id()
        await ipfs1.swarm.connect(ipfs2Id.addresses[0])

        const abort1 = new AbortController()
        const abort2 = new AbortController()
        const subscriptionTestObj1 = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon2,
          topic,
          timeout: 5000,
          options: { signal: abort1.signal }
        })
        const subscriptionTestObj2 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon2,
          topic,
          timeout: 5000,
          options: { signal: abort2.signal }
        })

        await subscriptionTestObj1.publishMessage(data)
        const [sub1Msg] = await subscriptionTestObj1.waitForMessages()
        const [sub2Msg] = await subscriptionTestObj2.waitForMessages()

        validateSubscriptionMessage(daemon2, topic, sub1Msg, data)
        validateSubscriptionMessage(daemon2, topic, sub2Msg, data)
        abort1.abort()
        abort2.abort()
        await subscriptionTestObj1.unsubscribe()
        await subscriptionTestObj2.unsubscribe()
      })

      it('should receive messages from a different node', async () => {
        const expectedString = 'hello from the other side'
        const data = uint8ArrayFromString(expectedString)

        const subscriptionTestObj1 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          topic,
          timeout: 5000
        })

        await subscriptionTestObj1.publishMessage(data)
        let [msg] = await subscriptionTestObj1.waitForMessages()
        await subscriptionTestObj1.unsubscribe()

        validateSubscriptionMessage(daemon1, topic, msg, data)

        const subscriptionTestObj2 = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon2,
          topic,
          timeout: 5000
        })

        await subscriptionTestObj2.publishMessage(data);
        [msg] = await subscriptionTestObj2.waitForMessages()
        validateSubscriptionMessage(daemon2, topic, msg, data)
        await subscriptionTestObj2.unsubscribe()
      })

      it('should round trip a non-utf8 binary buffer', async () => {
        const expectedHex = 'a36161636179656162830103056164a16466666666f4'
        const buffer = uint8ArrayFromString(expectedHex, 'base16')

        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          topic,
          timeout: 5000
        })
        await subscriptionTestObj.publishMessage(buffer)
        const [sub1Msg] = await subscriptionTestObj.waitForMessages()

        expect(uint8ArrayToString(sub1Msg.data, 'base16')).to.be.eql(expectedHex)
        expect(sub1Msg.from.toString()).to.eql(ipfs1Id.id.toString())
        validateSubscriptionMessage(daemon1, topic, sub1Msg, buffer)
        await subscriptionTestObj.unsubscribe()
      })

      it('.pubsub.subscribe - should receive multiple messages', async () => {
        const outbox = ['hello', 'world', 'this', 'is', 'pubsub']

        /**
         * ensure the subscription is kicked off early, and first.
         * Its promise does not return until it receives the data
         */
        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          topic,
          timeout: 15000
        })

        const validationMap = new Map()
        const publishPromises = outbox.map(async (string, i) => {
          const dataItem = uint8ArrayFromString(string)
          // keep a map of the string value to the validation function because we can't depend on ordering.
          // eslint-disable-next-line max-nested-callbacks
          validationMap.set(string, (msg) => validateSubscriptionMessage(daemon1, topic, msg, dataItem))
          return await subscriptionTestObj.publishMessage(dataItem)
        })
        await Promise.all(publishPromises)

        const sub1Msgs = await subscriptionTestObj.waitForMessages(outbox.length)

        expect(sub1Msgs).to.have.length(outbox.length)
        sub1Msgs.forEach((msg, i) => {
          const validationFn = validationMap.get(uint8ArrayToString(msg.data))
          validationFn(msg)
        })
        await subscriptionTestObj.unsubscribe()
      })

      it('should send/receive 100 messages', async function () {
        this.timeout(2 * 60 * 1000)

        const msgBase = 'msg - '
        const count = 100
        const subscriptionTestObj = await getSubscriptionTestObject({
          subscriber: daemon1,
          publisher: daemon2,
          topic,
          timeout: 15000
        })

        /**
         * @type {number}
         */
        const startTime = new Date().getTime()
        for (let i = 0; i < count; i++) {
          const data = uint8ArrayFromString(msgBase + i)
          await subscriptionTestObj.publishMessage(data)
        }
        const msgs = await subscriptionTestObj.waitForMessages(count)

        const duration = new Date().getTime() - startTime
        const opsPerSec = Math.floor(count / (duration / 1000))

        // eslint-disable-next-line
        console.log(`Send/Receive 100 messages took: ${duration} ms, ${opsPerSec} ops / s`)
        /**
         * Node is slower than browser and webworker because it's all running in the same process.
         *
         * TODO: Re-enable this test when we can make it more deterministic
         */
        // expect(opsPerSec).to.be.greaterThanOrEqual(isNode ? 25 : 200)

        msgs.forEach(msg => {
          expect(msg.from).to.eql(ipfs2Id.id)
          expect(uint8ArrayToString(msg.data).startsWith(msgBase)).to.be.true()
        })
      })

      it('should receive messages from a different node on lots of topics', async function () {
        // we can only currently have 6 topics subscribed at a time
        const numTopics = 6
        const resultingMsgs = []
        const msgPromises = []
        for (let i = 0; i < numTopics; i++) {
          const topic = `pubsub-topic-${i}`
          // const topicTestFn = async (topic) => {
          const expectedString = `hello pubsub ${Math.random().toString(32).slice(2)}`
          const data = uint8ArrayFromString(expectedString)
          const subscriptionTestObj = await getSubscriptionTestObject({
            subscriber: daemon1,
            publisher: daemon2,
            subscriptionListener: async (msg) => {
              // required to unsubscribe if there are more than 6 subscribed topics otherwise we get ERR_STREAM_PREMATURE_CLOSE
              // await subscriptionTestObj.unsubscribe()
              resultingMsgs.push(msg)
            },
            topic,
            timeout: 2000
          })
          await subscriptionTestObj.publishMessage(data)
          // const [msg] = await
          msgPromises.push(subscriptionTestObj.waitForMessages(1, { retries: 30, maxRetryTime: 40000 }))
        }
        await Promise.all(msgPromises)

        expect(resultingMsgs).to.have.length(numTopics)
      })

      it('should unsubscribe multiple handlers', async function () {
        this.timeout(2 * 60 * 1000)

        const topic = `topic-${Math.random()}`

        const stub1 = sinon.stub()
        const stub2 = sinon.stub()
        const subscriptionTestObj1 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          subscriptionListener: stub1,
          topic,
          timeout: 5000
        })
        const subscriptionTestObj2 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          subscriptionListener: stub2,
          topic,
          timeout: 5000
        })

        expect(stub1).to.have.property('callCount', 0)
        expect(stub2).to.have.property('callCount', 0)

        await daemon1.api.pubsub.publish(topic, uint8ArrayFromString('hello world 1'))

        await subscriptionTestObj1.waitForMessages()
        await subscriptionTestObj2.waitForMessages()

        expect(stub1).to.have.property('callCount', 1)
        expect(stub2).to.have.property('callCount', 1)

        await daemon2.api.pubsub.unsubscribe(topic)

        await daemon1.api.pubsub.publish(topic, uint8ArrayFromString('hello world 2'))

        await Promise.all([
          expect(subscriptionTestObj1.waitForMessages(2, { maxTimeout: 1000, maxRetryTime: 3000 })).to.be.rejectedWith('Wanting 2 messages but only have 1'),
          expect(subscriptionTestObj2.waitForMessages(2, { maxTimeout: 1000, maxRetryTime: 3000 })).to.be.rejectedWith('Wanting 2 messages but only have 1')
        ])

        expect(stub1).to.have.property('callCount', 1)
        expect(stub2).to.have.property('callCount', 1)
      })

      it('should unsubscribe individual handlers', async function () {
        this.timeout(2 * 60 * 1000)

        const topic = `topic-${Math.random()}`

        const stub1 = sinon.stub()
        const stub2 = sinon.stub()
        const subscriptionTestObj1 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          subscriptionListener: stub1,
          topic,
          timeout: 5000
        })
        const subscriptionTestObj2 = await getSubscriptionTestObject({
          subscriber: daemon2,
          publisher: daemon1,
          subscriptionListener: stub2,
          topic,
          timeout: 5000
        })

        expect(stub1).to.have.property('callCount', 0)
        expect(stub2).to.have.property('callCount', 0)

        await daemon1.api.pubsub.publish(topic, uint8ArrayFromString('hello world 1'))
        await subscriptionTestObj1.waitForMessages()
        await subscriptionTestObj2.waitForMessages()

        expect(stub1).to.have.property('callCount', 1)
        expect(stub2).to.have.property('callCount', 1)

        await subscriptionTestObj1.unsubscribe()

        await daemon1.api.pubsub.publish(topic, uint8ArrayFromString('hello world 2'))

        await Promise.all([
          expect(subscriptionTestObj1.waitForMessages(2, { maxTimeout: 1000, maxRetryTime: 3000 })).to.be.rejectedWith('Wanting 2 messages but only have 1'),
          expect(subscriptionTestObj2.waitForMessages(2, { maxTimeout: 1000, maxRetryTime: 3000 })).to.eventually.have.lengthOf(2)
        ])

        expect(stub1).to.have.property('callCount', 1)
        expect(stub2).to.have.property('callCount', 2)
      })
    })
  })
}
