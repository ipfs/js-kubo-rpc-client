/* eslint-env mocha */

import { isNode } from 'ipfs-utils/src/env.js'
import { expect } from 'aegir/chai'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { create as httpClient, KuboClient } from '../../src/index.js'
import http, { IncomingHttpHeaders } from 'http'

async function startServer (fn: (() => Promise<any>)) {
  let headersResolve: (value: IncomingHttpHeaders) => void
  const headers: Promise<IncomingHttpHeaders> = new Promise((resolve) => {
    headersResolve = resolve
  })

  // spin up a test http server to inspect the requests made by the library
  const server = http.createServer((req, res) => {
    req.on('data', () => {})
    req.on('end', () => {
      res.writeHead(200)
      res.write(JSON.stringify({}))
      res.end()
      server.close()

      headersResolve(req.headers)
    })
  })

  server.listen(6001, () => {
    fn().then(() => {}, () => {})
  })

  return await headers
}

describe('custom headers', function () {
  // do not test in browser
  if (!isNode) {
    return
  }

  let ipfs: KuboClient

  describe('supported in the constructor', function () {
    // initialize ipfs with custom headers
    before(function () {
      ipfs = httpClient({
        host: 'localhost',
        port: 6001,
        protocol: 'http',
        headers: {
          authorization: 'Bearer YOLO'
        }
      })
    })

    it('regular API calls', async function () {
      const headers = await startServer(async () => await ipfs.id())

      expect(headers.authorization).to.equal('Bearer YOLO')
    })

    it('multipart API calls', async function () {
      const headers = await startServer(async () => await ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
        create: true
      }))

      expect(headers.authorization).to.equal('Bearer YOLO')
    })
  })

  describe('supported as API call arguemnts', function () {
    // initialize ipfs with custom headers
    before(function () {
      ipfs = httpClient({
        host: 'localhost',
        port: 6001,
        protocol: 'http'
      })
    })

    it('regular API calls', async function () {
      const headers = await startServer(async () => await ipfs.id({
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })

    it('multipart API calls', async function () {
      const headers = await startServer(async () => await ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
        create: true,
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })
  })
})
