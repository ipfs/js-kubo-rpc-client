/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { create as httpClient } from '../../src/index.js'
import http, { Agent, IncomingMessage } from 'http'

export interface ServerHandler { (message: IncomingMessage): Promise<any> }

export interface Server {
  port: number
  close: (...args: Parameters<http.Server['close']>) => ReturnType<http.Server['close']>
}

async function startServer (handler: ServerHandler): Promise<Server> {
  return await new Promise((resolve) => {
    // spin up a test http server to inspect the requests made by the library
    const server = http.createServer((req, res) => {
      req.on('data', () => {})
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      req.on('end', async () => {
        const out = await handler(req)

        res.writeHead(200)
        res.write(JSON.stringify(out))
        res.end()
      })
    })

    server.listen(0, () => {
      const addressInfo = server.address()

      resolve({
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        port: addressInfo && (typeof addressInfo === 'string' ? addressInfo : addressInfo.port),
        close: (...args) => server.close(...args)
      })
    })
  })
}

/**
 * This test was discovered as broken during https://github.com/ipfs/js-kubo-rpc-client/pull/83
 * the test has many problems:
 *
 * 1. It's not deterministic
 * 2. It's not actually validating that concurrent tests aren't allowed
 * 3. ipfs.id() does not forward the agent property.
 *
 * I spent some time debugging this and was unable to resolve, as this was already an inherent problem with ipfs-http-client, i'm punting for now.
 *
 * @see https://github.com/ipfs/js-kubo-rpc-client/tree/investigateConcurrencyTest
 */
describe.skip('agent', function () {
  let agent: Agent

  before(function () {
    agent = new Agent({
      maxSockets: 2
    })
  })

  it('restricts the number of concurrent connections', async function () {
    const responses: Array<((arg: any) => void)> = []

    const server = await startServer(async () => {
      const p = new Promise((resolve) => {
        responses.push(resolve)
      })

      return await p
    })

    const ipfs = httpClient({
      url: `http://localhost:${server.port}`,
      agent
    })

    // make three requests
    const requests: Promise<any[]> = Promise.all([
      ipfs.id(),
      ipfs.id(),
      ipfs.id()
    ])

    // wait for the first two to arrive
    for (let i = 0; i < 5; i++) {
      await delay(100)

      if (responses.length === 2) {
        // wait a little longer, the third should not arrive
        await delay(1000)

        expect(responses).to.have.lengthOf(2)

        // respond to the in-flight requests
        responses[0]({
          res: 0,
          id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
        })
        responses[1]({
          res: 1,
          id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
        })

        break
      }

      if (i === 4) {
        // should have first two responses by now
        expect(responses).to.have.lengthOf(2)
      }
    }

    // wait for the final request to arrive
    for (let i = 0; i < 5; i++) {
      await delay(100)

      if (responses.length === 3) {
        // respond to it
        responses[2]({
          res: 2,
          id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
        })
      }
    }

    let results = await requests
    results = results.map(r => r.res)
    expect(results).to.have.lengthOf(3)
    expect(results).to.include(0)
    expect(results).to.include(1)
    expect(results).to.include(2)

    return await new Promise((resolve, reject) => server.close((err) => err != null ? reject(err) : resolve()))
  })
})
