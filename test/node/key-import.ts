import http from 'node:http'
import { expect } from 'aegir/chai'
import { create } from '../../src/index.ts'
import type { KuboRPCClient } from '../../src/index.ts'

describe('key import request', () => {
  let server: http.Server
  let client: KuboRPCClient
  let body: Buffer
  let url: URL
  let headers: http.IncomingHttpHeaders

  beforeEach(async () => {
    server = http.createServer((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', chunk => { chunks.push(chunk) })
      req.on('end', () => {
        body = Buffer.concat(chunks)
        url = new URL(req.url ?? '', 'http://localhost')
        headers = req.headers
        res.setHeader('content-type', 'application/json')

        // Model Kubo's required file argument, while retaining a legacy endpoint
        // response for the compatibility control below.
        if (url.searchParams.has('pem') || headers['content-type']?.startsWith('multipart/form-data; boundary=') === true) {
          res.end(JSON.stringify({ Id: 'test-key-id', Name: 'imported' }))
        } else {
          res.writeHead(500)
          res.end(JSON.stringify({ Message: 'file argument key is required', Code: 0, Type: 'error' }))
        }
      })
    })
    await new Promise<void>(resolve => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address == null || typeof address === 'string') {
      throw new Error('Missing test server address')
    }
    client = create(`http://127.0.0.1:${address.port}`)
  })

  afterEach(async () => {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => {
      server.close(err => { err == null ? resolve() : reject(err) })
    })
  })

  it('uploads binary key material as a multipart file', async () => {
    const key = Uint8Array.of(0, 255, 127, 1)
    const imported = await client.key.import('imported', key)
    expect(imported).to.deep.equal({ id: 'test-key-id', name: 'imported' })
    expect(url.pathname).to.equal('/api/v0/key/import')
    expect(url.searchParams.get('arg')).to.equal('imported')
    expect(url.searchParams.has('pem')).to.equal(false)
    expect(url.searchParams.has('password')).to.equal(false)
    expect(body.includes(Buffer.from(key))).to.equal(true)
    const boundary = headers['content-type']?.split('boundary=')[1]
    expect(body.toString()).to.include(`--${boundary}`)
    expect(body.toString()).to.include('Content-Disposition: form-data; name="file"')
  })

  it('forwards import options and custom headers', async () => {
    const pem = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
    await client.key.import('imported', new Blob([pem]), {
      format: 'pem-pkcs8-cleartext',
      ipnsBase: 'base36',
      allowAnyKeyType: true,
      headers: { 'x-test-import': 'present' }
    })
    expect(url.searchParams.get('format')).to.equal('pem-pkcs8-cleartext')
    expect(url.searchParams.get('ipns-base')).to.equal('base36')
    expect(url.searchParams.get('allow-any-key-type')).to.equal('true')
    expect(headers['x-test-import']).to.equal('present')
    expect(body.toString()).to.include(pem)
  })

  it('supports cleartext string input without a password', async () => {
    await client.key.import('imported', 'cleartext-key', { format: 'pem-pkcs8-cleartext' })
    expect(body.toString()).to.include('cleartext-key')
    expect(url.searchParams.has('password')).to.equal(false)
  })

  it('preserves the legacy password-based call', async () => {
    await client.key.import('imported', 'legacy-key', 'legacy-password', {
      headers: { 'x-test-import': 'legacy' }
    })
    expect(url.searchParams.get('pem')).to.equal('legacy-key')
    expect(url.searchParams.get('password')).to.equal('legacy-password')
    expect(headers['x-test-import']).to.equal('legacy')
    expect(body.length).to.equal(0)
  })

  it('honors an already aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(client.key.import('imported', Uint8Array.of(1), {
      signal: controller.signal
    })).to.eventually.be.rejectedWith(/abort/i)
  })
})
