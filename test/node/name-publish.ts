import { createServer } from 'node:http'
import { expect } from 'aegir/chai'
import { create } from '../../src/index.ts'
import type { NamePublishOptions } from '../../src/name/index.ts'
import type { AddressInfo } from 'node:net'

describe('name.publish sequence option', () => {
  for (const sequence of [0, 42, Number.MAX_SAFE_INTEGER, 9007199254740993n, 18446744073709551615n]) {
    it(`sends sequence ${sequence} without losing precision`, async () => {
      let query: URLSearchParams | undefined
      const server = createServer((req, res) => {
        query = new URL(req.url ?? '', 'http://localhost').searchParams
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ Name: 'test-name', Value: '/ipfs/test-value' }))
      })
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))

      try {
        const { port } = server.address() as AddressInfo
        const options: NamePublishOptions = { sequence }
        const result = await create({ url: `http://127.0.0.1:${port}` }).name.publish('/ipfs/test-value', options)

        expect(query?.get('sequence')).to.equal(sequence.toString())
        expect(query?.get('arg')).to.equal('/ipfs/test-value')
        expect(result).to.deep.equal({ name: 'test-name', value: '/ipfs/test-value' })
      } finally {
        server.closeAllConnections()
        await new Promise<void>((resolve, reject) => server.close(err => err != null ? reject(err) : resolve()))
      }
    })
  }

  it('leaves sequence selection to Kubo when omitted', async () => {
    let query: URLSearchParams | undefined
    const server = createServer((req, res) => {
      query = new URL(req.url ?? '', 'http://localhost').searchParams
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ Name: 'test-name', Value: '/ipfs/test-value' }))
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))

    try {
      const { port } = server.address() as AddressInfo
      await create({ url: `http://127.0.0.1:${port}` }).name.publish('/ipfs/test-value')
      expect(query?.has('sequence')).to.equal(false)
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server.close(err => err != null ? reject(err) : resolve()))
    }
  })
})
