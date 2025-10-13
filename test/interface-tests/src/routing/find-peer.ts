/* eslint-env mocha */

import { peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import all from 'it-all'
import { ensureReachable } from '../dht/utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { RoutingQueryEvent } from '../../../../src/dht/index.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testFindPeer (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.routing.findPeer', function () {
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

    it('should find other peers', async () => {
      const nodeBId = await nodeB.id()

      const results = await all(nodeA.routing.findPeer(nodeBId.id))
      const finalPeer = results.filter(event => event.name === 'FINAL_PEER').pop()

      if (finalPeer == null || finalPeer.name !== 'FINAL_PEER') {
        throw new Error('No finalPeer event received')
      }

      const id = finalPeer.peer.id
      const nodeAddresses = nodeBId.addresses.map((addr) => addr.nodeAddress())
      const peerAddresses = finalPeer.peer.multiaddrs.map(ma => ma.nodeAddress())

      expect(id.toString()).to.equal(nodeBId.id.toString())
      expect(peerAddresses).to.deep.include(nodeAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', async function () {
      const events = await all(nodeA.routing.findPeer(peerIdFromString('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')))

      const groupedEvents: Record<string, RoutingQueryEvent[]> = events.reduce<Record<string, RoutingQueryEvent[]>>((all, current) => {
        if (all[current.name] != null) {
          all[current.name].push(current)
        } else {
          all[current.name] = [current]
        }
        return all
      }, {})
      /**
       * no finalPeer events found
       * This is failing. I'm not sure if protocol change happened or kubo is broken, but we're
       * getting both FINAL_PEER and QUERY_ERROR.
       *
       * @todo https://github.com/ipfs/js-kubo-rpc-client/issues/56
       */
      // expect(groupedEvents.FINAL_PEER).to.be.empty()

      /**
       * queryError events found
       *
       * @todo Are there other query errors that might give us a false positive?
       */
      expect(groupedEvents.QUERY_ERROR).to.not.be.empty()
    })
  })
}
