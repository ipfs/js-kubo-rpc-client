/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { base64 } from 'multiformats/bases/base64'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

async function getBaseEncodedMultihashes (ipfs: KuboRPCClient): Promise<string[]> {
  const refs = await all(ipfs.refs.local())

  return refs.map(r => base64.encode(CID.parse(r.ref).multihash.bytes))
}

async function shouldHaveRef (ipfs: KuboRPCClient, cid: CID): Promise<void> {
  return expect(getBaseEncodedMultihashes(ipfs)).to.eventually.include(base64.encode(cid.multihash.bytes))
}

async function shouldNotHaveRef (ipfs: KuboRPCClient, cid: CID): Promise<void> {
  return expect(getBaseEncodedMultihashes(ipfs)).to.eventually.not.include(base64.encode(cid.multihash.bytes))
}

export function testGc (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.gc', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should run garbage collection', async () => {
      const res = await ipfs.add(uint8ArrayFromString('apples'))

      const pinset = await all(ipfs.pin.ls())
      expect(pinset.map(obj => obj.cid.toString())).includes(res.cid.toString())

      await ipfs.pin.rm(res.cid)
      await all(ipfs.repo.gc())

      const finalPinset = await all(ipfs.pin.ls())
      expect(finalPinset.map(obj => obj.cid.toString())).not.includes(res.cid.toString())
    })

    it('should clean up unpinned data', async () => {
      // Add some data. Note: this will implicitly pin the data, which causes
      // some blocks to be added for the data itself and for the pinning
      // information that refers to the blocks
      const addRes = await ipfs.add(uint8ArrayFromString('apples'))
      const cid = addRes.cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      await shouldHaveRef(ipfs, cid)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      await shouldHaveRef(ipfs, cid)

      // Unpin the data
      await ipfs.pin.rm(cid)

      // Run garbage collection
      await all(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      await shouldNotHaveRef(ipfs, cid)
    })

    it('should clean up removed MFS files', async () => {
      // Add a file to MFS
      await ipfs.files.write('/test', uint8ArrayFromString('oranges'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      await shouldHaveRef(ipfs, stats.cid)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is in MFS
      await shouldHaveRef(ipfs, stats.cid)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      await shouldNotHaveRef(ipfs, stats.cid)
    })

    it('should clean up block only after unpinned and removed from MFS', async () => {
      // Add a file to MFS
      await ipfs.files.write('/test', uint8ArrayFromString('peaches'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const mfsFileCid = stats.cid

      // Get the CID of the data in the file
      const block = await ipfs.block.get(mfsFileCid)

      // Add the data to IPFS (which implicitly pins the data)
      const addRes = await ipfs.add(block)
      const dataCid = addRes.cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain the data hash
      await shouldHaveRef(ipfs, dataCid)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is pinned and in MFS
      await shouldHaveRef(ipfs, dataCid)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      await shouldNotHaveRef(ipfs, mfsFileCid)
      await shouldHaveRef(ipfs, dataCid)

      // Unpin the data
      await ipfs.pin.rm(dataCid)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      await shouldNotHaveRef(ipfs, mfsFileCid)
      await shouldNotHaveRef(ipfs, dataCid)
    })

    it('should clean up indirectly pinned data after recursive pin removal', async () => {
      // Add some data
      const addRes = await ipfs.add(uint8ArrayFromString('pears'))
      const dataCid = addRes.cid

      // Unpin the data
      await ipfs.pin.rm(dataCid)

      // Create a link to the data from an object
      const obj = {
        Data: uint8ArrayFromString('fruit'),
        Links: [{
          Name: 'p',
          Hash: dataCid,
          Tsize: addRes.size
        }]
      }

      // Put the object into IPFS
      const objCid = await ipfs.dag.put(obj, {
        storeCodec: 'dag-pb'
      })

      // Putting an object doesn't pin it
      expect((await all(ipfs.pin.ls())).map(p => p.cid.toString())).not.includes(objCid.toString())

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain data and object hash
      await shouldHaveRef(ipfs, objCid)
      await shouldHaveRef(ipfs, dataCid)

      // Recursively pin the object
      await ipfs.pin.add(objCid, { recursive: true })

      // The data should now be indirectly pinned
      const pins = await all(ipfs.pin.ls())
      expect(pins.find(p => p.cid.toString() === dataCid.toString())).to.have.property('type', 'indirect')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the data
      // hash, because the data is still (indirectly) pinned
      await shouldHaveRef(ipfs, objCid)
      await shouldHaveRef(ipfs, dataCid)

      // Recursively unpin the object
      await ipfs.pin.rm(objCid.toString())

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      await shouldNotHaveRef(ipfs, objCid)
      await shouldNotHaveRef(ipfs, dataCid)
    })
  })
}
