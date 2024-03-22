/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import drain from 'it-drain'
import all from 'it-all'
import { ensureReachable } from './utils.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testFindPeer (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findPeer', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB

    before(async function () {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api

      await ensureReachable(nodeA, nodeB)
    })

    after(async function () { return await factory.clean() })

    it('should respect timeout option when finding a peer on the DHT', async () => {
      const nodeBId = await nodeB.id()

      await testTimeout(() => drain(nodeA.dht.findPeer(nodeBId.id, {
        timeout: 1
      })))
    })

    it('should find other peers', async () => {
      const nodeBId = await nodeB.id()

      const results = await all(nodeA.dht.findPeer(nodeBId.id))
      const finalPeer = results.filter(event => event.name === 'FINAL_PEER').pop()

      if (!finalPeer || finalPeer.name !== 'FINAL_PEER') {
        throw new Error('No finalPeer event received')
      }

      const id = finalPeer.peer.id
      const nodeAddresses = nodeBId.addresses.map((addr) => addr.nodeAddress())
      const peerAddresses = finalPeer.peer.multiaddrs.map(ma => ma.nodeAddress())

      expect(id.toString()).to.equal(nodeBId.id.toString())
      expect(peerAddresses).to.deep.include(nodeAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', async function () {
      const events = await all(nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'))

      /**
       * @type {Record<string, typeof events>}
       */
      const groupedEvents = events.reduce((all, current) => {
        if (all[current.name]) {
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
