/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory } from './utils/factory.js'
const f = factory()

describe('.commands', function () {
  this.timeout(60 * 1000)

  /** @type {import('../src/types').IPFS} */
  let ipfs

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(function () { return f.clean() })

  it('lists commands', async function () {
    const res = await ipfs.commands()

    expect(res).to.exist()
  })
})
