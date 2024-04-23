/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { getTopic } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testPublish (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.publish', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should fail with undefined msg', async () => {
      const topic = getTopic()
      // @ts-expect-error invalid parameter
      await expect(ipfs.pubsub.publish(topic)).to.eventually.be.rejected()
    })

    it('should publish message from buffer', async () => {
      const topic = getTopic()
      await ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
    })

    it('should publish 10 times within time limit', async () => {
      const count = 10
      const topic = getTopic()

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
      }
    })
  })
}
