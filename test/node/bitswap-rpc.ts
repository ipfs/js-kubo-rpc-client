import { createServer } from 'node:http'
import { peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { create } from '../../src/index.ts'
import type { KuboRPCClient } from '../../src/index.ts'
import type { IncomingHttpHeaders, Server } from 'node:http'
import type { AddressInfo } from 'node:net'

const peer = peerIdFromString('QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')
const cid = CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')

describe('bitswap RPC API', () => {
  let server: Server
  let client: KuboRPCClient
  let body: string
  let status: number
  let requests: Array<{ url: URL, method?: string, headers: IncomingHttpHeaders }>

  beforeEach(async () => {
    body = ''
    status = 200
    requests = []
    server = createServer((req, res) => {
      requests.push({ url: new URL(req.url ?? '', 'http://localhost'), method: req.method, headers: req.headers })
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(body)
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address() as AddressInfo
    client = create({ url: `http://127.0.0.1:${port}` })
  })

  afterEach(async () => {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(err => err != null ? reject(err) : resolve()))
  })

  it('reads a peer ledger without rounding uint64 counters', async () => {
    body = `{"Peer":"${peer}","Value":0.5,"Sent":9007199254740993,"Recv":18446744073709551615,"Exchanged":4}`
    const ledger = await client.bitswap.ledger(peer, { headers: { 'x-ledger-test': 'yes' } })

    expect(ledger.peer.toString()).to.equal(peer.toString())
    expect(ledger).to.include({ value: 0.5, sent: 9007199254740993n, recv: 18446744073709551615n, exchanged: 4n })
    expect(requests[0].method).to.equal('POST')
    expect(requests[0].url.pathname).to.equal('/api/v0/bitswap/ledger')
    expect(requests[0].url.searchParams.get('arg')).to.equal(peer.toString())
    expect(requests[0].headers['x-ledger-test']).to.equal('yes')
  })

  it('handles an empty reprovide response', async () => {
    expect(await client.bitswap.reprovide()).to.equal(undefined)
    expect(requests[0].method).to.equal('POST')
    expect(requests[0].url.pathname).to.equal('/api/v0/bitswap/reprovide')
  })

  it('propagates a ledger RPC error', async () => {
    status = 500
    body = JSON.stringify({ Message: 'ledger unavailable', Code: 0, Type: 'error' })
    await expect(client.bitswap.ledger(peer)).to.be.rejectedWith('ledger unavailable')
  })

  it('propagates a reprovide RPC error', async () => {
    status = 500
    body = JSON.stringify({ Message: 'reprovider disabled', Code: 0, Type: 'error' })
    await expect(client.bitswap.reprovide()).to.be.rejectedWith('reprovider disabled')
  })

  it('honors an aborted ledger request without contacting the server', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(client.bitswap.ledger(peer, { signal: controller.signal })).to.be.rejectedWith(/abort/i)
    expect(requests).to.have.lengthOf(0)
  })

  it('requests the wantlist for the supplied peer', async () => {
    body = JSON.stringify({ Keys: [{ '/': cid.toString() }] })
    const list = await client.bitswap.wantlist({ peer })
    expect(list.map(cid => cid.toString())).to.deep.equal([cid.toString()])
    expect(requests[0].url.searchParams.get('peer')).to.equal(peer.toString())
  })

  it('requests the local wantlist when peer is omitted', async () => {
    body = JSON.stringify({ Keys: null })
    expect(await client.bitswap.wantlist()).to.deep.equal([])
    expect(requests[0].url.searchParams.has('peer')).to.equal(false)
  })

  it('preserves the wantlistForPeer compatibility alias', async () => {
    body = JSON.stringify({ Keys: [{ '/': cid.toString() }] })
    const list = await client.bitswap.wantlistForPeer(peer)
    expect(list.map(cid => cid.toString())).to.deep.equal([cid.toString()])
    expect(requests[0].url.searchParams.get('peer')).to.equal(peer.toString())
  })
})
