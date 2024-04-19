/* eslint-env mocha */

import * as dagPB from '@ipld/dag-pb'
import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../../utils/mocha.js'
import type { KuboRPCClient } from '../../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRmLink (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.rmLink', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should remove a link from an existing node', async () => {
      const obj1 = {
        Data: uint8ArrayFromString('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: uint8ArrayFromString('patch test object 2'),
        Links: []
      }

      const nodeCid = await ipfs.dag.put(obj1, {
        storeCodec: 'dag-pb'
      })
      const childCid = await ipfs.dag.put(obj2, {
        storeCodec: 'dag-pb'
      })
      const { value: child } = await ipfs.dag.get(childCid)
      const childBuf = dagPB.encode(child)
      const childAsDAGLink = {
        Name: 'my-link',
        Tsize: childBuf.length,
        Hash: CID.createV0(await sha256.digest(childBuf))
      }
      const parentCid = await ipfs.object.patch.addLink(nodeCid, childAsDAGLink)
      const withoutChildCid = await ipfs.object.patch.rmLink(parentCid, childAsDAGLink)

      expect(withoutChildCid).to.not.deep.equal(parentCid)
      expect(withoutChildCid).to.deep.equal(nodeCid)

      /* TODO: revisit this assertions.
      const node = await ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject)
      expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
      */
    })

    it('returns error for request without arguments', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink(null, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request only one invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink('invalid', null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid first argument', () => {
      const root = ''
      const link = 'foo'

      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink(root, link)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
