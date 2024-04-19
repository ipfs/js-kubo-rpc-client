/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { fixtures, clearPins } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { PinAddInput } from '../../../../src/pin/index.js'
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
      return testAddPinInput(async function * () { // eslint-disable-line require-await
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
      return testAddPinInput(async function * () { // eslint-disable-line require-await
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
  })
}
