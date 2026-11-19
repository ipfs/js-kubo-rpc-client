import { peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import { factory } from './utils/factory.ts'
import type { KuboRPCClient } from '../src/index.ts'

const f = factory()
const peer = peerIdFromString('QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

describe('Bitswap RPC extensions against Kubo', function () {
  this.timeout(30 * 1000)
  let online: KuboRPCClient
  let offline: KuboRPCClient

  before(async () => {
    online = (await f.spawn({
      init: {
        config: {
          Routing: { Type: 'none' },
          Bootstrap: [],
          Discovery: { MDNS: { Enabled: false } }
        }
      }
    })).api
    offline = (await f.spawn({ start: { offline: true } })).api
  })

  after(async () => { await f.clean() })

  it('reads the zero ledger for a peer with no exchanges', async () => {
    const ledger = await online.bitswap.ledger(peer)
    expect(ledger.peer.toString()).to.equal(peer.toString())
    expect(ledger).to.include({ value: 0, sent: 0n, recv: 0n, exchanged: 0n })
  })

  it('accepts a peer option and preserves the compatibility alias', async () => {
    expect(await online.bitswap.wantlist({ peer })).to.deep.equal([])
    expect(await online.bitswap.wantlistForPeer(peer)).to.deep.equal([])
  })

  it('surfaces Kubo ledger offline errors', async () => {
    await expect(offline.bitswap.ledger(peer)).to.be.rejectedWith(/online/i)
  })

  it('surfaces Kubo reprovide offline errors', async () => {
    await expect(offline.bitswap.reprovide()).to.be.rejectedWith(/online/i)
  })
})
