/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { expect } from 'aegir/chai'
import first from 'it-first'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'
const f = factory()

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () { return f.clean() })

  // cannot get go-ipfs to generate logs
  it.skip('.log.tail', async function () {
    const i = setInterval(() => {
      try {
        void ipfs.add(uint8ArrayFromString('just adding some data to generate logs'))
      } catch (/** @type {any} */ _) {
        // this can error if the test has finished and we're shutting down the node
      }
    }, 1000)

    const message = await first(ipfs.log.tail())

    clearInterval(i)
    expect(message).to.be.an('object')
  })

  it('.log.ls', async function () {
    const res = await ipfs.log.ls()

    expect(res).to.exist()
    expect(res).to.be.an('array')
  })

  it('.log.level', async function () {
    const res = await ipfs.log.level('all', 'error')

    expect(res).to.exist()
    expect(res).to.be.an('object')
    expect(res).to.not.have.property('error')
    expect(res).to.have.property('message')
  })

  it('.log.getLevel for all subsystems', async function () {
    const res = await ipfs.log.getLevel()

    expect(res).to.exist()
    expect(res).to.be.an('object')
    // Should have subsystem names as keys with log levels as values
    const keys = Object.keys(res)
    expect(keys.length).to.be.greaterThan(0)
    // All values should be strings (log level names)
    for (const value of Object.values(res)) {
      expect(value).to.be.a('string')
    }
  })

  it('.log.getLevel for specific subsystem', async function () {
    const res = await ipfs.log.getLevel('all')

    expect(res).to.exist()
    expect(res).to.be.an('object')
    // Should have subsystem names as keys with log levels as values
    for (const value of Object.values(res)) {
      expect(value).to.be.a('string')
    }
  })

  it('.log.getLevel reflects changes made by .log.level', async function () {
    // Set level to debug
    await ipfs.log.level('all', 'debug')

    // Get all levels and verify they are set to debug
    const levels = await ipfs.log.getLevel()

    expect(levels).to.exist()
    expect(levels).to.be.an('object')
    // At least some subsystems should be set to debug
    const values = Object.values(levels)
    expect(values).to.include('debug')
  })
})
