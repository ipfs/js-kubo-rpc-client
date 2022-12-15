/* eslint-env mocha */

import { isMultiaddr } from '@multiformats/multiaddr'
import PeerId from 'peer-id'
import delay from 'delay'
import { isBrowser, isWebWorker } from 'ipfs-utils/src/env.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testPeers (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.peers', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsA
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfsBId

    before(async function () {
      ipfsA = (await factory.spawn({ type: 'go', ipfsOptions })).api
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      ipfsBId = await ipfsB.id()
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
      /* TODO: Seen if we still need this after this is fixed
         https://github.com/ipfs/js-ipfs/issues/2601 gets resolved */
      // await delay(60 * 1000) // wait for open streams in the connection available
    })

    after(async function () { return await factory.clean() })

    it('should list peers this node is connected to', async () => {
      const peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      const peer = peers[0]

      expect(peer).to.have.a.property('addr')
      expect(isMultiaddr(peer.addr)).to.equal(true)
      expect(peer.peer.toString()).not.to.be.undefined()
      expect(PeerId.parse(peer.peer.toString())).to.be.ok()
      expect(isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('direction')
      expect(peer.direction).to.be.oneOf(['inbound', 'outbound'])
      /**
       * When verbose: true is not passed, these will default to empty strings or null
       */
      expect(peer).to.have.a.property('latency')
      expect(peer.latency).to.be.a('string')
      expect(peer.latency).to.be.empty()
      expect(peer).to.have.a.property('muxer')
      expect(peer.muxer).to.be.a('string')
      expect(peer.muxer).to.be.empty()
      expect(peer).to.have.a.property('streams')
      expect(peer.streams).to.equal(null)
    })

    it('should list peers this node is connected to with verbose option', async () => {
      const peers = await ipfsA.swarm.peers({ verbose: true })
      expect(peers).to.have.length.above(0)

      const peer = peers[0]
      expect(peer).to.have.a.property('addr')
      expect(isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('peer')
      expect(peer).to.have.a.property('direction')
      expect(peer.direction).to.be.oneOf(['inbound', 'outbound'])
      expect(peer).to.have.a.property('latency')
      expect(peer.latency).to.match(/n\/a|[0-9]+[mµ]?s/) // n/a or 3ms or 3µs or 3s
      expect(peer).to.have.a.property('muxer')
      expect(peer.muxer).to.be.a('string')
      expect(peer.muxer).to.be.empty()
      expect(peer).to.have.a.property('streams')
      expect(peer.streams).not.to.equal(null)
      expect(peer.streams).to.be.a('array')
    })

    /**
     * @param {string | string[]} addrs
     * @returns
     */
    function getConfig (addrs) {
      addrs = Array.isArray(addrs) ? addrs : [addrs]

      return {
        Addresses: {
          Swarm: addrs,
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/127.0.0.1/tcp/0'
        },
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      }
    }

    it('should list peers only once', async () => {
      const nodeA = (await factory.spawn({ type: 'go', ipfsOptions })).api
      const nodeB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      const nodeBId = await nodeB.id()
      await nodeA.swarm.connect(nodeBId.addresses[0])
      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })

    it('should list peers only once even if they have multiple addresses', async () => {
      // TODO: Change to port 0, needs: https://github.com/ipfs/interface-ipfs-core/issues/152
      const config = getConfig(isBrowser && factory.opts.type !== 'go'
        ? [
            `${process.env.SIGNALA_SERVER}`,
            `${process.env.SIGNALB_SERVER}`
          ]
        : [
            '/ip4/127.0.0.1/tcp/26545/ws',
            '/ip4/127.0.0.1/tcp/26546/ws'
          ])

      const nodeA = (await factory.spawn({
        // browser nodes have webrtc-star addresses which can't be dialled by go so make the other
        // peer a js-ipfs node to get a tcp address that can be dialled. Also, webworkers are not
        // diable so don't use a in-proc node for webworkers
        type: 'go',
        ipfsOptions
      })).api
      const nodeAId = await nodeA.id()
      const nodeB = (await factory.spawn({
        type: isWebWorker ? 'go' : undefined,
        ipfsOptions: {
          config
        }
      })).api

      await nodeB.swarm.connect(nodeAId.addresses[0])

      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })
  })
}
