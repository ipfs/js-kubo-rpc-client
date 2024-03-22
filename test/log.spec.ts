/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { expect } from 'aegir/chai'
import { factory, KuboControlledClient } from './utils/factory.js'
const f = factory()

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfs: KuboControlledClient

  before(async function () {
    // @ts-expect-error: js-ipfsd-ctl relies on core types.
    ipfs = (await f.spawn()).api
  })

  after(async () => await f.clean())

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
})
