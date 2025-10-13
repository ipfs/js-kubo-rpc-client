/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { ensureReachable } from '../dht/utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testGet (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.routing.get', function () {
    this.timeout(80 * 1000)

    let nodeA: KuboRPCClient
    let nodeB: KuboRPCClient

    before(async function () {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api

      await ensureReachable(nodeA, nodeB)
    })

    after(async function () {
      await factory.clean()
    })

    it('should error when getting a non-existent key from the routing', async () => {
      const key = '/ipns/k51qzi5uqu5dl0dbfddy2wb42nvbc6anyxnkrguy5l0h0bv9kaih6j6vqdskqk'

      await expect(all(nodeA.routing.get(key))).to.eventually.be.rejected
        .with.property('message').that.include('not found')
    })

    it('should get a value after it was put on another node', async () => {
      const data = await nodeA.add('should put a value to the routing')
      const publish = await nodeA.name.publish(data.cid)
      const events = await all(nodeA.routing.get(`/ipns/${publish.name}`))
      const valueEvent = events.filter(event => event.name === 'VALUE').pop()

      if (valueEvent == null || valueEvent.name !== 'VALUE') {
        throw new Error('Value event not found')
      }

      expect(uint8ArrayToString(valueEvent.value)).to.contain(data.cid.toString())
    })
  })
}
