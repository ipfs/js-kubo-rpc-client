/* eslint-env mocha */

import * as dagPB from '@ipld/dag-pb'
import { expect } from 'aegir/chai'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'

const f = factory()

describe('.add', function () {
  this.timeout(20 * 1000)

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () { return f.clean() })

  it('should ignore metadata until https://github.com/ipfs/go-ipfs/issues/6920 is implemented', async function () {
    const data = uint8ArrayFromString('some data')
    const result = await ipfs.add(data, {
      // @ts-expect-error missing field
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
