/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { getDescribe, getIt } from '../utils/mocha.js'
import { fixtures, clearPins } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { PinAddInput } from '../../../../src/pin/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testAddAll (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.addAll', function () {
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

    async function testAddPinInput (source: Iterable<PinAddInput> | AsyncIterable<PinAddInput>): Promise<void> {
      const pinset = await all(ipfs.pin.addAll(source))

      expect(pinset).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])
    }

    it('should add an array of CIDs', async () => {
      return testAddPinInput([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])
    })

    it('should add a generator of CIDs', async () => {
      return testAddPinInput(function * () {
        yield fixtures.files[0].cid
        yield fixtures.files[1].cid
      }())
    })

    it('should add an async generator of CIDs', async () => {
      return testAddPinInput(async function * () {
        yield fixtures.files[0].cid
        yield fixtures.files[1].cid
      }())
    })

    it('should add an array of pins with options', async () => {
      return testAddPinInput([
        {
          cid: fixtures.files[0].cid,
          recursive: false
        },
        {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      ])
    })

    it('should add a generator of pins with options', async () => {
      return testAddPinInput(function * () {
        yield {
          cid: fixtures.files[0].cid,
          recursive: false
        }
        yield {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      }())
    })

    it('should add an async generator of pins with options', async () => {
      return testAddPinInput(async function * () {
        yield {
          cid: fixtures.files[0].cid,
          recursive: false
        }
        yield {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      }())
    })

    it('should add pins with individual names', async () => {
      const pins = await all(ipfs.pin.addAll([
        {
          cid: fixtures.files[0].cid,
          name: 'pin-1'
        },
        {
          cid: fixtures.files[1].cid,
          name: 'pin-2'
        }
      ]))

      expect(pins).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])

      // Verify names were set (need to use names flag to see them)
      const pinList = await all(ipfs.pin.ls({ names: true }))
      const pin1 = pinList.find(p => p.cid.equals(fixtures.files[0].cid))
      const pin2 = pinList.find(p => p.cid.equals(fixtures.files[1].cid))

      expect(pin1?.name).to.equal('pin-1')
      expect(pin2?.name).to.equal('pin-2')
    })

    it('should add pins with a global name option', async () => {
      const globalName = 'global-pin-name'
      const pins = await all(ipfs.pin.addAll([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ], { name: globalName }))

      expect(pins).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])

      // Verify global name was applied (name filter automatically enables names)
      const pinList = await all(ipfs.pin.ls({ name: globalName }))
      expect(pinList).to.have.lengthOf(2)
      expect(pinList.map(p => p.name)).to.deep.equal([globalName, globalName])
    })

    it('should prioritize individual names over global option', async () => {
      const globalName = 'global-name'
      const individualName = 'individual-name'

      const pins = await all(ipfs.pin.addAll([
        {
          cid: fixtures.files[0].cid,
          name: individualName
        },
        fixtures.files[1].cid
      ], { name: globalName }))

      expect(pins).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])

      // Verify individual name took precedence (need names flag)
      const pinList = await all(ipfs.pin.ls({ names: true }))
      const pin1 = pinList.find(p => p.cid.equals(fixtures.files[0].cid))
      const pin2 = pinList.find(p => p.cid.equals(fixtures.files[1].cid))

      expect(pin1?.name).to.equal(individualName)
      expect(pin2?.name).to.equal(globalName)
    })

    it('should add pins without names', async () => {
      const pins = await all(ipfs.pin.addAll([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ]))

      expect(pins).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])

      // Verify no names were set
      // Without names flag, names should be undefined
      const pinList = await all(ipfs.pin.ls())
      const pin1 = pinList.find(p => p.cid.equals(fixtures.files[0].cid))
      const pin2 = pinList.find(p => p.cid.equals(fixtures.files[1].cid))
      expect(pin1?.name).to.be.undefined()
      expect(pin2?.name).to.be.undefined()

      // Even with names flag, they should still be undefined since no names were set
      const pinListWithNames = await all(ipfs.pin.ls({ names: true }))
      const pin1WithNames = pinListWithNames.find(p => p.cid.equals(fixtures.files[0].cid))
      const pin2WithNames = pinListWithNames.find(p => p.cid.equals(fixtures.files[1].cid))
      expect(pin1WithNames?.name).to.be.undefined()
      expect(pin2WithNames?.name).to.be.undefined()
    })
  })
}
