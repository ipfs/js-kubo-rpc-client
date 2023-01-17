/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory, KuboControlledClient } from './utils/factory.js'
const f = factory()

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs: KuboControlledClient

  before(async function () {
    // @ts-expect-error: js-ipfsd-ctl relies on core types.
    ipfs = (await f.spawn()).api
  })

  after(async () => await f.clean())

  it('.repo.gc', async function () {
    const res = await ipfs.repo.gc()

    expect(res).to.exist()
  })

  it('.repo.stat', async function () {
    const res = await ipfs.repo.stat()

    expect(res).to.exist()
    expect(res).to.have.a.property('numObjects')
    expect(res).to.have.a.property('repoSize')
  })

  it('.repo.version', async function () {
    const res = await ipfs.repo.version()

    expect(res).to.exist()
  })
})
