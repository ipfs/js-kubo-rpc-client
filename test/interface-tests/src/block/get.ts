/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { identity } from 'multiformats/hashes/identity'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testGet (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.get', () => {
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

    it('should respect timeout option when getting a block', async () => {
      return testTimeout(async () => ipfs.block.get(CID.parse('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rA3'), {
        timeout: 1
      }))
    })

    it('should get by CID', async () => {
      const block = await ipfs.block.get(cid)

      expect(block).to.equalBytes(uint8ArrayFromString('blorb'))
    })

    it('should get an empty block', async () => {
      const cid = await ipfs.block.put(new Uint8Array(0), {
        format: 'dag-pb',
        mhtype: 'sha2-256',
        version: 0
      })

      const block = await ipfs.block.get(cid)
      expect(block).to.equalBytes(new Uint8Array(0))
    })

    it('should get a block added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const cidv1 = await ipfs.block.put(input, {
        version: 1,
        format: 'dag-pb'
      })
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const block = await ipfs.block.get(cidv0)
      expect(block).to.equalBytes(input)
    })

    it('should get a block with an identity CID, without putting first', async () => {
      const identityData = uint8ArrayFromString('A16461736466190144', 'base16upper')
      const identityHash = identity.digest(identityData)
      const identityCID = CID.createV1(identity.code, identityHash)
      const block = await ipfs.block.get(identityCID)
      expect(block).to.equalBytes(identityData)
    })

    it('should return an error for an invalid CID', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.get('Non-base58 character')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
