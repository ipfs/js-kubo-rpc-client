/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { create as httpClient } from '../../src/index.js'
import http, { Agent } from 'http'

/**
 * @typedef {{port: number, server: http.Server}} ServerWrapper
 */
/**
 *
 * @param {(message: import('http').IncomingMessage) => Promise<any>} handler
 * @returns {Promise<>}
 */
function startServer (handler) {
  return new Promise((resolve) => {
    // spin up a test http server to inspect the requests made by the library
    const server = http.createServer({ keepAlive: true }, (req, res) => {
      req.on('data', (chunk) => {
        console.log('server data received', chunk)
      })
      req.on('end', async () => {
        const out = await handler({ req, nowHrtime: process.hrtime.bigint(), now: Date.now() })

        res.writeHead(200)
        res.write(JSON.stringify(out))
        res.end()
      })
    })
    // server.timeout = 100
    // server.requestTimeout = 1000
    // server.keepAliveTimeout = 1000
    // server.maxRequestsPerSocket = 1
    // server.maxConnections = 1

    server.listen(0, () => {
      const addressInfo = server.address()

      resolve({
        port: addressInfo && (typeof addressInfo === 'string' ? addressInfo : addressInfo.port),
        // close: (...args) => {
        //   server.closeAllConnections()
        //   server.close(...args)
        // },
        server
      })
    })
  })
}

function getNumRequests (ipfs, num) {
  return Promise.all(Array(num).fill(0).map(() => ipfs.id()))
}

describe('agent', function () {
  /** @type {Agent} */
  let rpcAgent
  /** @type {ServerWrapper} */
  let serverWrapper
  /** @type {import('../../src/types.js').IPFSHTTPClient} */
  let ipfs

  before(async function () {
    // http.globalAgent.maxSockets = 1
    rpcAgent = new Agent({
      keepAlive: false,
      maxSockets: 1,
      maxTotalSockets: 1,
      // maxFreeSockets: 1,
      maxConnections: 1,
      scheduling: 'fifo',
      totalSocketCount: 1,
      timeout: 1
      // keepAliveMsecs: 20
    })
    serverWrapper = await startServer(({ req, now, nowHrtime }) => {
      console.log('now: ', now)
      console.log('nowHrtime: ', nowHrtime)
      const p = new Promise((resolve) => {
        responses.push(resolve)
      })

      return p
    })

    ipfs = httpClient({
      url: `http://localhost:${serverWrapper.port}`,
      agent: rpcAgent
    })
  })

  const responses = []
  after(function (done) {
    const { server } = serverWrapper
    ipfs.stop()
    server.closeAllConnections()

    // return new Promise((resolve, reject) => server.close((err) => err != null ? reject(err) : resolve()))
    responses.forEach((r) => r())
    server.close(done)
  })
  it('restricts the number of concurrent connections', async function () {
    const { server } = serverWrapper
    const connectReq = []
    server.on('connect', (socket) => {
      console.log(`adding connect. total = ${connectReq.length}`)
      connectReq.push(socket)
    })
    const reqs = []
    server.on('request', (socket) => {
      console.log(`adding request. total = ${reqs.length}`)
      reqs.push(socket)
    })
    const upgrades = []
    server.on('upgrade', (socket) => {
      console.log(`adding upgrade. total = ${upgrades.length}`)
      upgrades.push(socket)
    })
    const connections = []
    server.on('connection', (socket) => {
      console.log(`adding connection. total = ${connections.length}`)
      connections.push(socket)
    })
    const droppedRequests = []
    server.on('dropRequest', (socket) => {
      console.log(`adding dropRequest. total = ${droppedRequests.length}`)
      droppedRequests.push(socket)
    })

    /**
     * We shouldn't require this because our http.agent logic should be handling this for us
     */
    // server.maxConnections = 1
    // make requests
    let requests = getNumRequests(ipfs, 3)
    function logInfo () {
      // eslint-disable-next-line no-console
      console.log('--------------------------------------')
      // eslint-disable-next-line no-console
      console.log('connectReq.length: ', connectReq.length)
      // eslint-disable-next-line no-console
      console.log('reqs.length: ', reqs.length)
      // eslint-disable-next-line no-console
      console.log('upgrades.length: ', upgrades.length)
      // eslint-disable-next-line no-console
      console.log('connections.length: ', connections.length)
      // eslint-disable-next-line no-console
      console.log('droppedRequests.length: ', droppedRequests.length)
      // eslint-disable-next-line no-console
      console.log('responses.length: ', responses.length)
    }

    await delay(1000)
    logInfo()
    expect(connections).to.have.length(1)
    responses.forEach((r, i) => r({ res: i }))
    try {
      const awaitedReqs = await requests
      console.log('awaitedReqs: ', awaitedReqs)
    } catch (err) {
      console.error('error awaiting requests', err)
    }

    server.maxConnections = 2

    requests = getNumRequests(ipfs, 3)
    await delay(1000)
    expect(connections).to.have.length(2)
    responses.forEach((r, i) => r({ res: i }))
    try {
      const awaitedReqs = await requests
      console.log('awaitedReqs: ', awaitedReqs)
    } catch (err) {
      console.error('error awaiting requests', err)
    }

    // wait for the first two to arrive
    // for (let i = 0; i < 5; i++) {
    //   await delay(100)

    //   if (responses.length === 2) {
    //     // wait a little longer, the third should not arrive
    //     await delay(1000)

    //     expect(responses).to.have.lengthOf(2)

    //     // respond to the in-flight requests
    //     responses[0]({
    //       res: 0,
    //       id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    //     })
    //     responses[1]({
    //       res: 1,
    //       id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    //     })

    //     break
    //   }

    //   if (i === 4) {
    //     // should have first two responses by now
    //     expect(responses).to.have.lengthOf(2)
    //   }
    // }

    // // wait for the final request to arrive
    // for (let i = 0; i < 5; i++) {
    //   await delay(100)

    //   if (responses.length === 3) {
    //     // respond to it
    //     responses[2]({
    //       res: 2,
    //       id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    //     })
    //   }
    // }

    // console.log('waiting on requests')
    // let results = await requests
    // console.log('done waiting on requests')
    // results = results.map(r => r.res)
    // expect(results).to.have.lengthOf(3)
    // expect(results).to.include(0)
    // expect(results).to.include(1)
    // expect(results).to.include(2)

    return Promise.resolve()
  })
})
