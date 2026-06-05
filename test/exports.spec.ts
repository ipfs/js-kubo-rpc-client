import { multiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import * as IpfsHttpClient from '../src/index.ts'

describe('exports', function () {
  it('should export the expected types and utilities', function () {
    expect(IpfsHttpClient.CID).to.equal(CID)
    expect(IpfsHttpClient.multiaddr).to.equal(multiaddr)
  })
})
