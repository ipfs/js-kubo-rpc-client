/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { expect } from 'aegir/chai'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import first from 'it-first'
import { factory } from './utils/factory.js'
const f = factory()

describe('.log', function () {
  this.timeout(100 * 1000)

  /**
   * @type {import('../src/index').IPFSHTTPClient}
   */
  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  /**
   * `ipfs log tail --help`
   *  WARNING:   EXPERIMENTAL, command may change in future releases
   *
   *  USAGE
   *    ipfs log tail - Read the event log.
   *
   *  SYNOPSIS
   *    ipfs log tail
   *
   *  DESCRIPTION
   *
   *    Outputs event log messages (not other log messages) as they are generated.
   */
  it.skip('.log.tail', async () => {
    // const addValue = uint8ArrayFromString('just adding some data to generate logs')
    const logLevels = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']
    const i = setInterval(async () => {
      try {
        const randomInt = Math.floor(Math.random() * logLevels.length)
        const randomLogLevel = logLevels[randomInt]
        await ipfs.log.level('all', randomLogLevel)
      } catch (/** @type {any} */ _) {
        // this can error if the test has finished and we're shutting down the node
      }
    }, 1000)

    // const abortController = new AbortController()
    // /**
    //  * @type {import('ipfs-core-types').AbortOptions}
    //  */
    // const tailAbortOptions = {
    //   signal: abortController.signal
    // }
    // const message = await first(ipfs.log.tail(tailAbortOptions))
    const ipfs2 = (await f.spawn({ env: { IPFS_LOGGING: 'debug' } })).api
    // console.log('ipfs2: ', ipfs2)
    const res = await ipfs2.log.level('all', 'debug')
    console.log('res: ', res)
    expect(res).to.exist()
    expect(res).to.be.an('object')
    expect(res).to.not.have.property('error')
    expect(res).to.have.property('message')
    const message = await first(ipfs2.log.tail())
    // setTimeout(() => abortController.abort(), 5000)
    clearInterval(i)
    expect(message).to.be.an('object')
  })

  it('.log.ls', async () => {
    const res = await ipfs.log.ls()

    expect(res).to.exist()
    expect(res).to.be.an('array')
  })

  it('.log.level', async () => {
    const res = await ipfs.log.level('all', 'error')

    expect(res).to.exist()
    expect(res).to.be.an('object')
    expect(res).to.not.have.property('error')
    expect(res).to.have.property('message')
  })
})
