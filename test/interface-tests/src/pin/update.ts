/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { fixtures, clearPins, expectPinned, expectNotPinned, pinTypes } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testUpdate (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.update', function () {
    this.timeout(50 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api

      await drain(
        ipfs.addAll(
          fixtures.files.map(file => ({ content: file.data })), {
            pin: false
          }
        )
      )

      await drain(
        ipfs.addAll(fixtures.directory.files.map(
          file => ({
            path: file.path,
            content: file.data
          })
        ), {
          pin: false
        })
      )
    })

    after(async function () {
      await factory.clean()
    })

    beforeEach(async function () {
      return clearPins(ipfs)
    })

    it('should update a recursive pin', async () => {
      // First pin the old object
      await ipfs.pin.add(fixtures.directory.cid)

      // Create a new object to update to that links to one of the existing files
      const newObject = await ipfs.dag.put({
        Data: uint8ArrayFromString('new object'),
        Links: [{
          Name: 'ipfs-add.js',
          Hash: fixtures.directory.files[0].cid,
          Tsize: 0
        }]
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      // Update the pin
      const result = await ipfs.pin.update(fixtures.directory.cid, newObject)

      // Check the result
      expect(result).to.deep.include(newObject)

      // Verify old pin is removed
      await expectNotPinned(ipfs, fixtures.directory.cid)

      // Verify new pin is added
      await expectPinned(ipfs, newObject, pinTypes.recursive)

      // Verify the linked file is still pinned indirectly
      await expectPinned(ipfs, fixtures.directory.files[0].cid, pinTypes.indirect)

      // Verify the old recursive object is not pinned
      await expectNotPinned(ipfs, fixtures.directory.files[1].cid)
    })

    it('should update a recursive pin without removing the old pin', async () => {
      // First pin the old object
      await ipfs.pin.add(fixtures.directory.cid)

      // Create a new object to update to that links to one of the existing files
      const newObject = await ipfs.dag.put({
        Data: uint8ArrayFromString('new object'),
        Links: [{
          Name: 'ipfs-add.js',
          Hash: fixtures.directory.files[0].cid,
          Tsize: 0
        }]
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      // Update the pin without removing the old one
      const result = await ipfs.pin.update(fixtures.directory.cid, newObject, {
        unpin: false
      })

      // Check the result
      expect(result).to.deep.include(newObject)

      // Verify old pin is still there
      await expectPinned(ipfs, fixtures.directory.cid, pinTypes.recursive)

      // Verify new pin is added
      await expectPinned(ipfs, newObject, pinTypes.recursive)

      // Verify the linked file is pinned indirectly through both objects
      await expectPinned(ipfs, fixtures.directory.files[0].cid, pinTypes.indirect)

      // Verify the unlinked file is still pinned indirectly through the old object
      await expectPinned(ipfs, fixtures.directory.files[1].cid, pinTypes.indirect)
    })

    it('should update a recursive pin with a name label', async () => {
      // First pin the old object with a name
      const pinName = 'my-label'
      await ipfs.pin.add(fixtures.directory.cid, { name: pinName })

      // Create a new object to update to that links to one of the existing files
      const newObject = await ipfs.dag.put({
        Data: uint8ArrayFromString('new object'),
        Links: [{
          Name: 'ipfs-add.js',
          Hash: fixtures.directory.files[0].cid,
          Tsize: 0
        }]
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      // Update the pin
      const result = await ipfs.pin.update(fixtures.directory.cid, newObject)

      // Check the result
      expect(result).to.deep.include(newObject)

      // Verify old pin is removed
      await expectNotPinned(ipfs, fixtures.directory.cid)
      // Verify the old recursive object is not pinned
      await expectNotPinned(ipfs, fixtures.directory.files[1].cid)

      // Verify new pin is added and has the name label
      const pinset = await all(ipfs.pin.ls({ name: pinName }))
      expect(pinset).to.have.lengthOf(1)
      expect(pinset[0].cid.toString()).to.equal(newObject.toString())
      expect(pinset[0].name).to.equal(pinName)
    })

    it('should fail to update a non-recursive pin', async () => {
      // First pin the old object directly
      await ipfs.pin.add(fixtures.directory.cid, {
        recursive: false
      })

      // Create a new object to update to
      const newObject = await ipfs.dag.put({
        Data: uint8ArrayFromString('new object'),
        Links: []
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      // Try to update the pin
      await expect(ipfs.pin.update(fixtures.directory.cid, newObject))
        .to.eventually.be.rejectedWith(/not recursively pinned/)
    })

    it('should fail to update a non-existent pin', async () => {
      // Create a new object to update to
      const newObject = await ipfs.dag.put({
        Data: uint8ArrayFromString('new object'),
        Links: []
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      // Try to update a non-existent pin
      await expect(ipfs.pin.update(fixtures.directory.cid, newObject))
        .to.eventually.be.rejectedWith(/not recursively pinned/)
    })
  })
}
