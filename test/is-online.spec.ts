/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'

const f = factory()

describe('.isOnline', function () {
  this.timeout(20 * 1000)

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () { return f.clean() })

  it('should return true when the node is online', async function () {
    await expect(ipfs.isOnline()).to.eventually.be.true()
  })

  it('should return false when the node is offline', async function () {
    await f.controllers[0].stop()
    await expect(ipfs.isOnline()).to.eventually.be.false()
  })
})
