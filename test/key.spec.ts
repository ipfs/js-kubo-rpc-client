/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory, KuboControlledClient } from './utils/factory.js'
const f = factory()

describe('.key', function () {
  this.timeout(50 * 1000)

  let ipfs: KuboControlledClient

  before(async function () {
    // @ts-expect-error: js-ipfsd-ctl relies on core types.
    ipfs = (await f.spawn()).api
  })

  after(async () => await f.clean())

  describe('.gen', function () {
    it('create a new rsa key', async function () {
      const res = await ipfs.key.gen('foobarsa', { type: 'rsa', size: 2048 })

      expect(res).to.exist()
    })

    it('create a new ed25519 key', async function () {
      const res = await ipfs.key.gen('bazed', { type: 'ed25519' })

      expect(res).to.exist()
    })
  })

  describe('.list', function () {
    it('both keys show up + self', async function () {
      const res = await ipfs.key.list()

      expect(res).to.exist()
      expect(res.length).to.equal(3)
    })
  })
})
