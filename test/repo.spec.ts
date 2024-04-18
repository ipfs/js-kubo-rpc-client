/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'

const f = factory()

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () { return f.clean() })

  it('.repo.gc', async function () {
    const res = await all(ipfs.repo.gc())

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
