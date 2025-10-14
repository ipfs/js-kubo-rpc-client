/* eslint-env mocha */

import http from 'http'
import { expect } from 'aegir/chai'
import pDefer from 'p-defer'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode } from 'wherearewe'
import { create as httpClient } from '../../src/index.js'
import type { KuboRPCClient } from '../../src/index.js'
import type { IncomingHttpHeaders } from 'node:http'

async function startServer (fn: () => any): Promise<IncomingHttpHeaders> {
  const headersResolve = pDefer<IncomingHttpHeaders>()

  // spin up a test http server to inspect the requests made by the library
  const server = http.createServer((req, res) => {
    req.on('data', () => {})
    req.on('end', () => {
      res.writeHead(200)
      res.write(JSON.stringify({}))
      res.end()
      server.close()

      headersResolve.resolve(req.headers)
    })
  })

  server.listen(6001, () => {
    fn().then(() => {}, () => {})
  })

  return headersResolve.promise
}

describe('custom headers', function () {
  // do not test in browser
  if (!isNode) {
    return
  }

  let ipfs: KuboRPCClient

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
      const headers = await startServer(async () => ipfs.id())

      expect(headers.authorization).to.equal('Bearer YOLO')
    })

    it('multipart API calls', async function () {
      const headers = await startServer(async () => ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
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
      const headers = await startServer(async () => ipfs.id({
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })

    it('multipart API calls', async function () {
      const headers = await startServer(async () => ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
        create: true,
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })
  })
})
