/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { create as httpClient } from '../../src/index.js'
import http, { Agent } from 'http'

http.globalAgent.maxSockets = 2
const clientTimeoutMs = 20
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
    let numRequests = 0
    let finalData = JSON.stringify({
      res: -99,
      id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    })
    // spin up a test http server to inspect the requests made by the library
    const server = http.createServer({
      // keepAlive: true,
      // keepAliveTimeout: clientTimeoutMs * 2,
      connectionsCheckingInterval: clientTimeoutMs,
      // requestTimeout: 500,
      // headersTimeout: 200,
      noDelay: true,
      keepAliveInitialDelay: 1

    }, (req, res) => {
      const currentRequest = numRequests++

      req.on('error', (e) => {
        finalData = JSON.stringify({
          res: -99,
          id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
        })
        console.error(`problem with request ${currentRequest}: ${e.message}`)
        console.error(e)
        req.end()
      })
      req.on('end', async () => {
      //   // currentRequest++

        console.log('request end received ', currentRequest)
        console.log('request end - readableAborted? ', req.readableAborted)
        console.log('request end - aborted? ', req.aborted)
        res.write(finalData)
        res.end()
        //   const responsePromise = handler({ req, nowHrtime: process.hrtime.bigint(), now: Date.now() })
        //   // const out = await responsePromise
        //   let finalData = JSON.stringify({
        //     res: -99,
        //     id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
        //   })
        //   try {
        //     // const out = await Promise.race([responsePromise, delay(2500)])
        //     const out = await responsePromise
        //     if (req.socket.destroyed) {
        //       return req.destroy()
        //     }
        //     console.log('out: ', out)
        //     await delay(2000)
        //     res.writeHead(200)
        //     // const out = { req, nowHrtime: process.hrtime.bigint(), now: Date.now() }
        //     // await delay(2000)
        //     try {
        //       finalData = JSON.stringify(out)
        //     } catch {}
        //     res.write(finalData)
        //     res.end()
        //   } catch (err) {
        //     console.error('server error')
        //     res.writeHead(200)
        //     // const out = { req, nowHrtime: process.hrtime.bigint(), now: Date.now() }
        //     // await delay(2000)

      //     res.write(finalData)
      //     res.end()
      //   }
      })
    })
    let numConnections = 0
    const socketSet = new Set()
    server.on('connection', function (socket) {
      socket.allowHalfOpen = false

      // socket.
      const currentConnection = numConnections++
      const responsePromise = handler({ socket, nowHrtime: process.hrtime.bigint(), now: Date.now() })
      console.info('SOCKET OPENED' + JSON.stringify(socket.address()))
      // if (socket.id != null) {
      //   console.log('socket has id:', socket.id)
      // } else {
      //   socket.id = Math.random().toString(34).slice(2)
      //   console.log('created socket ID:', socket.id)
      // }
      // if (socketSet.has(socket)) {
      //   console.log('socket is already in the set')
      // } else {
      //   console.log('socket is not in the set')
      //   socketSet.add(socket)
      // }
      // console.log('socket: ', socket)
      socket.on('connect', () => {
        console.log('socket connect received', currentConnection)
      })
      socket.on('data', (chunk) => {
        console.log('socket data received', currentConnection)
        // console.log(chunk.toString())
      })
      socket.on('drain', () => {
        console.log('socket drain received', currentConnection)
      })
      socket.on('end', async () => {
        console.info('SOCKET END: other end of the socket sends a FIN packet')
        console.log('socket end - readableAborted? ', socket.readableAborted)
        console.log('socket end - aborted? ', socket.aborted)
        console.log('socket end received', currentConnection)
        const result = await responsePromise
        console.log('')
        socket.write(JSON.stringify(result))
        socket.end()
      })
      socket.on('lookup', () => {
        console.log('socket lookup received', currentConnection)
      })
      socket.on('ready', () => {
        console.log('socket ready received', currentConnection)
      })
      socket.on('timeout', () => {
        console.info('SOCKET TIMEOUT')
        socket.destroy(new Error('timeout'))
        console.log('socket timeout received', currentConnection)
      })

      socket.on('error', function (error) {
        console.log('socket error received', currentConnection)
        console.info('SOCKET ERROR: ' + JSON.stringify(error))
      })

      socket.on('close', function (hadError) {
        console.log('socket close received', currentConnection)
        console.info('SOCKET CLOSED. IT WAS ERROR: ' + hadError)
        // socket.destroy()
      })
      server.once('timeout', function (timedOutSocket) {
        console.log('server timeout received', currentConnection)
        timedOutSocket.write('socket timed out!')
        timedOutSocket.end()
      })
    })

    // server.timeout = 100
    // server.requestTimeout = 1000
    // server.keepAliveTimeout = 1000
    // server.maxRequestsPerSocket = 1
    // server.maxConnections = 1
    // server.maxRequestsPerSocket = 1
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

/**
 *
 * @param {import('../../src/types.js').IPFSHTTPClient} ipfs
 * @param {number} num
 * @returns {Array<Promise<import('../../src/types.js').IDResult | null>>}
 */
function getNumRequests (ipfs, num) {
  return Array(num).fill(0).map(() => ipfs.id())
}

describe('agent', function () {
  /** @type {Agent} */
  let rpcAgent
  /** @type {ServerWrapper} */
  let serverWrapper
  /** @type {import('../../src/types.js').IPFSHTTPClient} */
  let ipfs
  /**
   * @type {Array<(value: any) => void>}
   */
  const unresolvedResponses = []

  before(async function () {
    // http.globalAgent.maxSockets = 1
    rpcAgent = new Agent({
      keepAlive: true,
      maxSockets: 2,
      maxTotalSockets: 2,

      maxRequestsPerSocket: 1,
      // maxSockets: 1,
      timeout: 2000,
      // maxSockets: 1
      // maxTotalSockets: 1,
      // // // maxFreeSockets: 1,
      // // maxConnections: 1,
      // // scheduling: 'fifo',
      // totalSocketCount: 1
      // timeout: 1
      keepAliveMsecs: 20
    })
    serverWrapper = await startServer(({ req, now, nowHrtime }) => {
      console.log('now: ', now)
      console.log('nowHrtime: ', nowHrtime)
      const p = new Promise((resolve) => {
        unresolvedResponses.push(resolve)
        console.log(`adding unresolvedResponse. total = ${unresolvedResponses.length}`)
      })

      return p
    })

    ipfs = httpClient({
      url: `http://localhost:${serverWrapper.port}`,
      agent: rpcAgent
    })
  })

  // after(function (done) {
  //   const { server } = serverWrapper
  //   // ipfs.stop()
  //   server.closeAllConnections()

  //   // return new Promise((resolve, reject) => server.close((err) => err != null ? reject(err) : resolve()))
  //   // responses.forEach((r) => r())
  //   server.close(done)
  // })
  it('restricts the number of concurrent connections', async function () {
    const { server } = serverWrapper
    this.timeout(20000)

    // /**
    //  * @type {{req: http.IncomingMessage, socket: http.Socket}[]}
    //  */
    // const connectReq = []
    // server.on('connect', (req, socket) => {
    //   connectReq.push({ req, socket })
    //   console.log(`adding connect. total = ${connectReq.length}`)
    // })
    // /**
    //  * @type {{req: InstanceType<Request>, res: InstanceType<Response> & { req: InstanceType<Request> }}[]}
    //  */
    // const reqs = []
    // server.on('request', (req, res) => {
    //   reqs.push({ req, res })
    //   console.log(`adding request. total = ${reqs.length}`)
    //   console.log('unresolvedResponses.length: ', unresolvedResponses.length)
    // })
    // /**
    //  * @type {{req: http.IncomingMessage, socket: Socket}[]}
    //  */
    // const upgrades = []
    // server.on('upgrade', (req, socket) => {
    //   connectReq.push({ req, socket })
    //   console.log(`adding upgrade. total = ${upgrades.length}`)
    // })
    // /**
    //  * @type {http.Socket[]}
    //  */
    // const connections = []
    // server.on('connection', (socket) => {
    //   connections.push(socket)
    //   console.log(`adding connection. total = ${connections.length}`)
    //   console.log('unresolvedResponses.length: ', unresolvedResponses.length)
    // })

    // const droppedRequests = []
    // server.on('dropRequest', (...args) => {
    //   droppedRequests.push([...args])
    //   console.log(`adding dropRequest. total = ${droppedRequests.length}`)
    // })

    // server.on('clientError', (err, socket) => {
    //   console.log('client error received')
    //   console.log('socket: ', socket)
    //   console.log('err: ', err)
    // })
    /**
     * We shouldn't require this because our http.agent logic should be handling this for us
     */
    // server.maxConnections = 1
    // make requests
    const requests = getNumRequests(ipfs, 10)
    const failures = []
    requests.forEach((r, i) => {
      r.then((result) => {
        console.log('got result', result)
        return result
      }).catch((reason) => {
        failures.push(i)
        console.log(`request ${i} failed with reason ${reason}`)
        // connections[0]
        return null
      })
    })
    while (unresolvedResponses.length === 0) {
      await delay(clientTimeoutMs)
    }
    // const i = 0
    // for await (const provideResponse of unresolvedResponses.slice(0, 2)) {
    //   provideResponse({
    //     res: i++,
    //     id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    //   })
    //   await delay(5000)
    // }
    // unresolvedResponses.forEach(async (ur, i) => {
    //   ur({
    //     res: i,
    //     id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    //   })
    //   await delay(1000)
    // })
    unresolvedResponses[0]({
      res: 0,
      id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    })
    await Promise.all(requests)
    // unresolvedResponses[1]({
    //   res: 1,
    //   id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    // })
    // unresolvedResponses[2]({
    //   res: 2,
    //   id: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
    // })
    function logInfo () {
      // eslint-disable-next-line no-console
      console.log('--------------------------------------')
      // eslint-disable-next-line no-console
      // console.log('connectReq.length: ', connectReq.length)
      // // eslint-disable-next-line no-console
      // console.log('reqs.length: ', reqs.length)
      // // eslint-disable-next-line no-console
      // console.log('upgrades.length: ', upgrades.length)
      // // eslint-disable-next-line no-console
      // console.log('connections.length: ', connections.length)
      // // eslint-disable-next-line no-console
      // console.log('droppedRequests.length: ', droppedRequests.length)
      // eslint-disable-next-line no-console
      console.log('unresolvedResponses.length: ', unresolvedResponses.length)
    }

    // await delay(1000)
    logInfo()

    // requests.forEach((r) => {

    // })
    logInfo()
    expect([1, 2, 3]).to.have.length(1)
    // responses.forEach((r, i) => r({ res: i }))
    // try {
    //   const awaitedReqs = await requests
    //   console.log('awaitedReqs: ', awaitedReqs)
    // } catch (err) {
    //   console.error('error awaiting requests', err)
    // }

    // server.maxConnections = 2

    // requests = getNumRequests(ipfs, 3)
    // await delay(1000)
    // expect(connections).to.have.length(2)
    // responses.forEach((r, i) => r({ res: i }))
    // try {
    //   const awaitedReqs = await requests
    //   console.log('awaitedReqs: ', awaitedReqs)
    // } catch (err) {
    //   console.error('error awaiting requests', err)
    // }

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
