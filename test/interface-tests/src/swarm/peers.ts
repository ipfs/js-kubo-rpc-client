/* eslint-env mocha */

import { peerIdFromString } from '@libp2p/peer-id'
import { isMultiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import delay from 'delay'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { Config } from '../../../../src/config/index.js'
import type { IDResult, KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testPeers (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.peers', function () {
    this.timeout(80 * 1000)

    let ipfsA: KuboRPCClient
    let ipfsB: KuboRPCClient
    let ipfsBId: IDResult

    before(async function () {
      ipfsA = (await factory.spawn()).api
      ipfsB = (await factory.spawn()).api
      ipfsBId = await ipfsB.id()
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should list peers this node is connected to', async () => {
      const peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      const peer = peers[0]

      expect(peer).to.have.a.property('addr')
      expect(isMultiaddr(peer.addr)).to.equal(true)
      expect(peer.peer.toString()).not.to.be.undefined()
      expect(peerIdFromString(peer.peer.toString())).to.be.ok()
      expect(isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('direction')
      expect(peer.direction).to.be.undefined()
      /**
       * When verbose: true is not passed, these will default to empty strings or null
       */
      expect(peer).to.have.a.property('latency')
      expect(peer.latency).to.be.undefined()
      expect(peer).to.have.a.property('muxer')
      expect(peer.muxer).to.be.undefined()
      expect(peer).to.have.a.property('streams')
      expect(peer.streams).to.be.undefined()
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
      expect(peer.muxer).to.be.undefined()
      expect(peer).to.have.a.property('streams')
      expect(peer.streams).not.to.equal(null)
      expect(peer.streams).to.be.a('array')
    })

    function getConfig (addrs: string | string[]): Config {
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
      const nodeA = (await factory.spawn()).api
      const nodeB = (await factory.spawn()).api
      const nodeBId = await nodeB.id()
      await nodeA.swarm.connect(nodeBId.addresses[0])
      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })

    it('should list peers only once even if they have multiple addresses', async () => {
      const config = getConfig([
        '/ip4/127.0.0.1/tcp/0/ws',
        '/ip4/127.0.0.1/tcp/0/ws'
      ])

      const nodeA = (await factory.spawn({
        // browser nodes have webrtc-star addresses which can't be dialled by go so make the other
        // peer a js-ipfs node to get a tcp address that can be dialled. Also, webworkers are not
        // diable so don't use a in-proc node for webworkers
        type: 'kubo',
        init: {
          config
        }
      })).api
      const nodeAId = await nodeA.id()
      const nodeB = (await factory.spawn({
        type: 'kubo',
        init: {
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
