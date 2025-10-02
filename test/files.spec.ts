/* eslint-env mocha */

import * as dagPB from '@ipld/dag-pb'
import { expect } from 'aegir/chai'
import { UnixFS } from 'ipfs-unixfs'
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

  it('should send metadata when provided (affects CID) but not return it until issue #6920 is resolved', async function () {
    const data = uint8ArrayFromString('some data')
    const result = await ipfs.add(data, {
      // @ts-expect-error missing field
      mode: 0o600,
      mtime: {
        secs: 1000,
        nsecs: 500
      }
    })

    // Metadata is not returned in response yet (issue #6920)
    expect(result).to.not.have.property('mode')
    expect(result).to.not.have.property('mtime')
    expect(result).to.have.property('cid')

    const { cid } = result
    expect(cid).to.have.property('code', dagPB.code)
    // CID is different because metadata is now properly sent to the API
    expect(cid.toString()).to.equal('QmPDB1sHH2FNqwJm2A6747uf6JUZyEB2cnNFRPz2uzjoDZ')

    // Verify metadata is stored in UnixFS structure via DAG API
    const dagNode = await ipfs.dag.get(cid)
    const pbData = dagNode.value.Data
    const unixfs = UnixFS.unmarshal(pbData)

    // Verify mode and mtime are stored
    expect(unixfs.mode).to.equal(0o600)
    expect(unixfs.mtime?.secs).to.equal(1000n)
    expect(unixfs.mtime?.nsecs).to.equal(500)
  })
})
