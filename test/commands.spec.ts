/* eslint-env mocha */

import { expect } from 'aegir/chai'
import type { KuboClient } from '../src/index.js'
import { factory } from './utils/factory.js'
const f = factory()

describe('.commands', function () {
  this.timeout(60 * 1000)

  let ipfs: KuboClient

  before(async function () {
    // @ts-expect-error: js-ipfsd-ctl relies on core types.
    ipfs = (await f.spawn()).api
  })

  after(async function () { return await f.clean() })

  it('lists commands', async function () {
    const res = await ipfs.commands()

    expect(res).to.exist()
  })
})
