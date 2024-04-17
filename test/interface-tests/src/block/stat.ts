/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testStat (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.stat', () => {
    const data = uint8ArrayFromString('blorb')
    let ipfs: KuboRPCClient
    let cid: CID

    before(async function () {
      ipfs = (await factory.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(async function () {
      await factory.clean()
    })

    it('should respect timeout option when statting a block', async () => {
      return testTimeout(async () => ipfs.block.stat(CID.parse('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn'), {
        timeout: 1
      }))
    })

    it('should stat by CID', async () => {
      const stats = await ipfs.block.stat(cid)
      expect(stats.cid.toString()).to.equal(cid.toString())
      expect(stats).to.have.property('size', data.length)
    })

    it('should return error for missing argument', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
