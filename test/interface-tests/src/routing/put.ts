/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { ensureReachable } from '../dht/utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testPut (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.routing.put', function () {
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

    it('should put a value to the routing', async function () {
      const { cid } = await nodeA.add('should put a value to the routing')

      const publish = await nodeA.name.publish(cid)
      let record

      for await (const event of nodeA.routing.get(`/ipns/${publish.name}`)) {
        if (event.name === 'VALUE') {
          record = event.value
          break
        }
      }

      if (record == null) {
        throw new Error('Could not find value')
      }

      const events = await all(nodeA.routing.put(`/ipns/${publish.name}`, record, { verbose: true }))
      const valueResponse = events.filter(event => event.name === 'VALUE').pop()

      expect(valueResponse).to.not.be.empty()
    })
  })
}
