/* eslint-env mocha */

import { clearRemotePins, addRemotePins, clearServices } from '../utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../../utils/mocha.js'
import all from 'it-all'
import { CID } from 'multiformats/cid'
import { byCID } from '../../utils/index.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {{name: string, cid: CID<unknown, number, number, Version>, status: string}} TestCIDObject
 */

const cid1 = CID.parse('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
const cid2 = CID.parse('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
const cid3 = CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
const cid4 = CID.parse('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')

/** @type {TestCIDObject[]} */
const testCIDs = [
  { name: 'one', cid: cid1, status: 'queued' },
  { name: 'pinned-two', cid: cid2, status: 'pinned' },
  { name: 'pinning-three', cid: cid3, status: 'pinning' },
  { name: 'failed-four', cid: cid4, status: 'failed' }
]

function getTestCIDByProperty (prop, value) {
  const foundTestCID = testCIDs.find((v) => v[prop] === value)
  if (foundTestCID != null) {
    return foundTestCID
  }
  throw new Error(`No test CID found where .'${prop}'=${value}`)
}
/**
 * @param {string[]} names
 * @returns {Record<string,CID<unknown, number, number, Version>>}
 */
function getTestCIDsAsObject (...names) {
  /**
   * @type {Record<string,CID<unknown, number, number, Version>>}
   */
  const object = {}
  names.forEach((name) => {
    const foundTestCID = getTestCIDByProperty('name', name)
    if (foundTestCID != null) {
      object[name] = foundTestCID.cid
    }
  })

  return object
}
/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testLs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = `${process.env.PINNING_SERVICE_KEY}`
  const SERVICE = 'pinbot-pin.remote.ls'

  describe('.pin.remote.ls', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfsd-ctl').Controller<'go'>['api']} */
    let ipfs
    before(async function () {
      ipfs = (await factory.spawn()).api

      expect(ENDPOINT.toString()).not.to.be.empty()
      expect(KEY).not.to.be.empty()
      await ipfs.pin.remote.service.add(SERVICE, {
        endpoint: ENDPOINT,
        key: KEY
      })
    })
    after(async function () {
      await clearRemotePins(ipfs)
      await clearServices(ipfs)
      await factory.clean()
    })

    it('requires service option', async () => {
      const result = ipfs.pin.remote.ls({})
      await expect(all(result)).to.eventually.be.rejectedWith(/service name must be passed/)
    })
    describe('before adding pins', function () {
      it('list no pins', async () => {
        const result = ipfs.pin.remote.ls({ service: SERVICE })
        const pins = await all(result)
        expect(pins).to.deep.equal([])
      })
    })
    describe('after adding pins', function () {
      this.timeout(200 * 1000)
      before(async function () {
        // another pin is being added somewhere when full test suite is ran
        // and not being cleared out.
        await clearRemotePins(ipfs)
        await addRemotePins(ipfs, SERVICE, getTestCIDsAsObject('one', 'pinned-two', 'pinning-three', 'failed-four'))
      })

      describe('list pins by status', function () {
        this.timeout(120 * 1000)
        const testCIDQueued = getTestCIDByProperty('status', 'queued')
        const testCIDPinned = getTestCIDByProperty('status', 'pinned')
        const testCIDPinning = getTestCIDByProperty('status', 'pinning')
        const testCIDFailed = getTestCIDByProperty('status', 'failed')
        it('list only pinned pins by default', async function () {
          const list = await all(ipfs.pin.remote.ls({
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCIDPinned])
        })

        it('should list "queued" pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['queued'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCIDQueued])
        })

        it('should list "pinning" pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['pinning'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCIDPinning])
        })

        it('should list "failed" pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['failed'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCIDFailed])
        })

        it('should list queued+pinned pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['queued', 'pinned'],
            service: SERVICE
          }))

          expect(list.sort(byCID)).to.deep.equal([testCIDQueued, testCIDPinned].sort(byCID))
        })

        it('should list queued+pinned+pinning pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['queued', 'pinned', 'pinning'],
            service: SERVICE
          }))

          expect(list.sort(byCID)).to.deep.equal([testCIDQueued, testCIDPinned, testCIDPinning].sort(byCID))
        })

        it('should list queued+pinned+pinning+failed pins', async () => {
          const list = await all(ipfs.pin.remote.ls({
            status: ['queued', 'pinned', 'pinning', 'failed'],
            service: SERVICE
          }))

          expect(list.sort(byCID)).to.deep.equal([testCIDQueued, testCIDPinned, testCIDPinning, testCIDFailed].sort(byCID))
        })
      })

      describe('list pins by name', () => {
        it('should list no pins when names do not match', async () => {
          const list = await all(ipfs.pin.remote.ls({
            name: 'd',
            status: ['queued', 'pinning', 'pinned', 'failed'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([])
        })
        it('should list only pins with matching names', async function () {
          const testCID = getTestCIDByProperty('name', 'one')
          const list = await all(ipfs.pin.remote.ls({
            name: testCID.name,
            status: ['queued', 'pinning', 'pinned', 'failed'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCID])
        })

        it('should list only pins with matching names & status', async function () {
          this.timeout(120 * 1000)
          const testCID = getTestCIDByProperty('cid', cid3)

          const list = await all(ipfs.pin.remote.ls({
            name: testCID.name,
            status: [testCID.status],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCID])
        })
      })

      describe('list pins by cid', () => {
        it('should list pins with matching cid', async () => {
          const testCID = getTestCIDByProperty('cid', cid1)
          const list = await all(ipfs.pin.remote.ls({
            cid: [testCID.cid],
            status: ['queued', 'pinned', 'pinning', 'failed'],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCID])
        })

        it('should list pins with any matching cid', async () => {
          const testCID1 = getTestCIDByProperty('cid', cid1)
          const testCID2 = getTestCIDByProperty('cid', cid4)
          const list = await all(ipfs.pin.remote.ls({
            cid: [testCID1.cid, testCID2.cid],
            status: ['queued', 'pinned', 'pinning', 'failed'],
            service: SERVICE
          }))

          expect(list.sort(byCID)).to.deep.equal([testCID1, testCID2].sort(byCID))
        })

        it('should list pins with matching cid+status', async () => {
          const testCID1 = getTestCIDByProperty('cid', cid2)
          const testCID2 = getTestCIDByProperty('cid', cid3)

          const list = await all(ipfs.pin.remote.ls({
            cid: [testCID1.cid, testCID2.cid],
            status: [testCID1.status, testCID2.status],
            service: SERVICE
          }))

          expect(list.sort(byCID)).to.deep.equal([testCID1, testCID2].sort(byCID))
        })

        it('should list pins with matching cid+status+name', async () => {
          const testCID1 = getTestCIDByProperty('cid', cid1)
          const testCID2 = getTestCIDByProperty('cid', cid2)
          const testCID3 = getTestCIDByProperty('cid', cid3)

          const list = await all(ipfs.pin.remote.ls({
            cid: [testCID1.cid, testCID2.cid, testCID3.cid],
            name: testCID2.name,
            status: [testCID2.status, testCID3.status],
            service: SERVICE
          }))

          expect(list).to.deep.equal([testCID2])
        })
      })
    })
  })
}
