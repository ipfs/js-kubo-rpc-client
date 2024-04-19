/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { ensureReachable } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testQuery (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.query', function () {
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

    it('should return the other node in the query', async function () {
      /** @type {string[]} */
      const peers = []
      const nodeBId = await nodeB.id()

      for await (const event of nodeA.dht.query(nodeBId.id)) {
        if (event.name === 'PEER_RESPONSE') {
          peers.push(...event.closer.map(data => data.id.toString()))
        }
      }

      expect(peers).to.include(nodeBId.id.toString())
    })
  })
}
