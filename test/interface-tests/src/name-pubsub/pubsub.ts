/* eslint-env mocha */

import { publicKeyFromProtobuf } from '@libp2p/crypto/keys'
import { peerIdFromPublicKey, peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import delay from 'delay'
import { multihashToIPNSRoutingKey, unmarshalIPNSRecord } from 'ipns'
import { ipnsValidator } from 'ipns/validator'
import last from 'it-last'
import { base58btc } from 'multiformats/bases/base58'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { isNode } from 'wherearewe'
import { getDescribe, getIt } from '../utils/mocha.js'
import waitFor from '../utils/wait-for.js'
import type { IDResult, KuboRPCClient, Message } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode, KuboOptions } from 'ipfsd-ctl'

const namespace = '/record/'
const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

const daemonsOptions: KuboOptions = {
  type: 'kubo',
  start: {
    ipnsPubsub: true
  }
}

export function testPubsub (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub', () => {
    // TODO make this work in the browser and between daemon and in-proc in nodes
    if (!isNode) { return }

    let nodes
    let nodeA: KuboRPCClient
    let nodeB: KuboRPCClient
    let idA: IDResult
    let idB: IDResult

    before(async function () {
      this.timeout(120 * 1000)

      nodes = await Promise.all([
        factory.spawn({ ...daemonsOptions }),
        factory.spawn({ ...daemonsOptions })
      ])

      nodeA = nodes[0].api
      nodeB = nodes[1].api

      const ids = await Promise.all([
        nodeA.id(),
        nodeB.id()
      ])

      idA = ids[0]
      idB = ids[1]

      await nodeA.swarm.connect(idB.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should publish and then resolve correctly', async function () {
      this.timeout(80 * 1000)

      let subscribed = false

      function checkMessage (): void {
        subscribed = true
      }

      const alreadySubscribed = (): boolean => {
        return subscribed
      }

      const routingKey = multihashToIPNSRoutingKey(idA.id.toMultihash())
      const topic = `${namespace}${uint8ArrayToString(routingKey, 'base64url')}`

      await expect(last(nodeB.name.resolve(idA.id)))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/not found/)

      await waitFor(async () => {
        const res = await nodeA.pubsub.peers(topic)
        return Boolean(res?.length > 0)
      }, { name: `node A to subscribe to ${topic}` })
      await nodeB.pubsub.subscribe(topic, checkMessage)
      await nodeA.name.publish(ipfsRef, { resolve: false })
      await waitFor(alreadySubscribed)
      await delay(1000) // guarantee record is written

      const res = await last(nodeB.name.resolve(idA.id))

      expect(res).to.equal(ipfsRef)
    })

    it('should self resolve, publish and then resolve correctly', async function () {
      this.timeout(6000)
      const emptyDirCid = '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
      const { path } = await nodeA.add(uint8ArrayFromString('pubsub records'))

      const resolvesEmpty = await last(nodeB.name.resolve(idB.id))
      expect(resolvesEmpty).to.be.eq(emptyDirCid)

      await expect(last(nodeA.name.resolve(idB.id)))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/not found/)

      const publish = await nodeB.name.publish(path)
      expect(publish).to.be.eql({
        name: idB.id,
        value: `/ipfs/${path}`
      })

      const resolveB = await last(nodeB.name.resolve(idB.id))
      expect(resolveB).to.be.eq(`/ipfs/${path}`)
      await delay(1000)
      const resolveA = await last(nodeA.name.resolve(idB.id))
      expect(resolveA).to.be.eq(`/ipfs/${path}`)
    })

    it('should handle event on publish correctly', async function () {
      this.timeout(80 * 1000)

      const testAccountName = 'test-account'

      let publishedMessage: Message
      function checkMessage (msg: Message): void {
        publishedMessage = msg
      }

      const alreadySubscribed = (): boolean => {
        return Boolean(publishedMessage)
      }

      // Create account for publish
      const testAccount = await nodeA.key.gen(testAccountName, {
        type: 'rsa',
        size: 2048,
        'ipns-base': 'b58mh'
      })

      const routingKey = multihashToIPNSRoutingKey(peerIdFromString(testAccount.id).toMultihash())
      const topic = `${namespace}${uint8ArrayToString(routingKey, 'base64url')}`

      await nodeB.pubsub.subscribe(topic, checkMessage)
      await nodeA.name.publish(ipfsRef, { resolve: false, key: testAccountName })
      await waitFor(alreadySubscribed)

      // @ts-expect-error publishedMessage is set in handler
      if (publishedMessage == null) {
        throw new Error('Pubsub handler not invoked')
      }

      const publishedMessageData = unmarshalIPNSRecord(publishedMessage.data)

      if (publishedMessageData.pubKey == null) {
        throw new Error('No public key found in message data')
      }

      if (publishedMessage.type === 'unsigned') {
        throw new Error('Message was unsigned')
      }

      const messageKey = publishedMessage.from
      const publicKey = publicKeyFromProtobuf(publishedMessageData.pubKey)
      const pubKeyPeerId = peerIdFromPublicKey(publicKey)

      expect(pubKeyPeerId.toString()).not.to.equal(messageKey.toString())
      expect(pubKeyPeerId.toString()).to.equal(testAccount.id)
      expect(publishedMessage.from).to.equal(idA.id)
      expect(messageKey.toString()).to.equal(idA.id)
      expect(publishedMessageData.value).to.equal(ipfsRef)

      // Verify the signature
      const keyBytes = base58btc.decode(`z${pubKeyPeerId.toString()}`)
      const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])
      await ipnsValidator(key, publishedMessage.data)
    })
  })
}
