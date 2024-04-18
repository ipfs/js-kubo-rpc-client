/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { ensureReachable } from '../dht/utils.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'
import type { CID } from 'multiformats/cid'

export function testFindProvs (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.routing.findProvs', function () {
    this.timeout(80 * 1000)

    let nodeA: KuboRPCClient
    let nodeB: KuboRPCClient
    let nodeC: KuboRPCClient

    before(async function () {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api
      nodeC = (await factory.spawn()).api

      await ensureReachable(nodeB, nodeA)
      await ensureReachable(nodeC, nodeB)
    })

    after(async function () {
      await factory.clean()
    })

    let providedCid: CID

    before('add providers for the same cid', async function () {
      const cids = await Promise.all([
        nodeB.dag.put({}),
        nodeC.dag.put({})
      ])

      providedCid = cids[0]

      await Promise.all([
        all(nodeB.routing.provide(providedCid)),
        all(nodeC.routing.provide(providedCid))
      ])
    })

    it('should respect timeout option when finding providers on the routing', async () => {
      await testTimeout(async () => {
        await drain(nodeA.routing.findProvs(providedCid, {
          timeout: 1
        }))
      })
    })

    it('should be able to find providers', async function () {
      const providerIds: string[] = []

      for await (const event of nodeA.routing.findProvs(providedCid)) {
        if (event.name === 'PROVIDER') {
          providerIds.push(...event.providers.map(prov => prov.id.toString()))
        }
      }

      const nodeBId = await nodeB.id()
      const nodeCId = await nodeC.id()

      expect(providerIds).to.include(nodeBId.id.toString())
      expect(providerIds).to.include(nodeCId.id.toString())
    })
  })
}
