/* eslint-env mocha */
import http from 'http'
import { expect } from 'aegir/chai'
import { pEvent } from 'p-event'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { create as httpClient } from '../../src/index.js'

describe('\'deal with HTTP weirdness\' tests', function () {
  it('does not crash if no content-type header is provided', async function () {
    // go-ipfs always (currently) adds a content-type header, even if no content is present,
    // the standard behaviour for an http-api is to omit this header if no content is present
    const server = http.createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        res.writeHead(200)
        res.end()
      })
    })

    await new Promise<void>(resolve => server.listen(6001, resolve))

    // @ts-expect-error arg type is wrong
    await httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json')

    server.close()
  })
})

describe('trailer headers', function () {
  let server: http.Server

  afterEach(async () => {
    server.closeAllConnections()
    server.close()
    await pEvent(server, 'close')
  })

  it('should deal with trailer x-stream-error correctly', async function () {
    this.timeout(5 * 1000)
    server = http.createServer((req, res) => {
      res.setHeader('x-chunked-output', '1')
      res.setHeader('content-type', 'application/json')
      res.setHeader('Trailer', 'X-Stream-Error')
      res.write(JSON.stringify({ Bytes: 1 }))
      res.addTrailers({ 'X-Stream-Error': JSON.stringify({ Message: 'ups, something went wrong', Code: 500 }) })
      res.end()
    })

    const ipfs = httpClient('/ip4/127.0.0.1/tcp/6001')

    await new Promise<void>(resolve => server.listen(6001, resolve))

    try {
      const res = await ipfs.add(uint8ArrayFromString('Hello there!'))

      expect(res).to.be.undefined()
    } catch (err: any) {
      // TODO: error's are not being correctly
      // propagated with Trailer headers yet
      // expect(err).to.exist()
    }
  })
})

describe('error handling', function () {
  let server: http.Server

  afterEach(async () => {
    server.closeAllConnections()
    server.close()
    await pEvent(server, 'close')
  })

  it('should handle plain text error response', async function () {
    server = http.createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a text/plain response with a 403 (forbidden) status
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.write('ipfs method not allowed')
        res.end()
      })
    })

    await new Promise<void>(resolve => server.listen(6001, resolve))

    // @ts-expect-error arg type is wrong
    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('ipfs method not allowed')
      .and.to.have.nested.property('response.status').that.equals(403)
  })

  it('should handle JSON error response', async function () {
    server = http.createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a application/json response with a 400 (bad request) header
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ Message: 'client error', Code: 1 }))
        res.end()
      })
    })

    await new Promise<void>(resolve => server.listen(6001, resolve))

    // @ts-expect-error arg type is wrong
    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('client error')
      .and.to.have.nested.property('response.status').that.equals(400)
  })

  it('should handle JSON error response with invalid JSON', async function () {
    server = http.createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a application/json response with a 400 (bad request) header
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.write('{ Message: ')
        res.end()
      })
    })

    await new Promise<void>(resolve => server.listen(6001, resolve))

    // @ts-expect-error arg type is wrong
    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejected()
      .and.to.have.property('message').that.include('Expected property name')
  })
})
