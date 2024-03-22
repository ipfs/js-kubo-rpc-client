/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/chai'
import * as dagPB from '@ipld/dag-pb'
import { factory, KuboControlledClient } from './utils/factory.js'
const f = factory()

describe('.add', function () {
  this.timeout(20 * 1000)

  let ipfs: KuboControlledClient

  before(async function () {
    // @ts-expect-error: js-ipfsd-ctl relies on core types.
    ipfs = (await f.spawn()).api
  })

  after(async () => await f.clean())

  it('should ignore metadata until https://github.com/ipfs/go-ipfs/issues/6920 is implemented', async function () {
    const data = uint8ArrayFromString('some data')
    const result = await ipfs.add(data, {
      // @ts-expect-error
      mode: 0o600,
      mtime: {
        secs: 1000,
        nsecs: 0
      }
    })

    expect(result).to.not.have.property('mode')
    expect(result).to.not.have.property('mtime')
    expect(result).to.have.property('cid')

    const { cid } = result
    expect(cid).to.have.property('code', dagPB.code)
    expect(cid.toString()).to.equal('QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS')
  })
})
