/* eslint-env mocha */

import { clearRemotePins, addRemotePins, clearServices } from '../utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../../utils/mocha.js'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import { byCID } from '../../utils/index.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testRmAll (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = `${process.env.PINNING_SERVICE_KEY}`
  const SERVICE = 'pinbot-pin.remote.rmAll'

  const cid1 = CID.parse('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
  const cid2 = CID.parse('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
  const cid3 = CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  const cid4 = CID.parse('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')

  describe('.pin.remote.rmAll', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async function () {
      ipfs = (await factory.spawn()).api
      await ipfs.pin.remote.service.add(SERVICE, {
        endpoint: ENDPOINT,
        key: KEY
      })
    })
    after(async function () {
      await clearServices(ipfs)
      await factory.clean()
    })

    beforeEach(async function () {
      await addRemotePins(ipfs, SERVICE, {
        'queued-a': cid1,
        'pinning-b': cid2,
        'pinned-c': cid3,
        'failed-d': cid4
      })
    })
    afterEach(async function () {
      await clearRemotePins(ipfs)
    })

    it('.rmAll requires service option', async () => {
      const result = ipfs.pin.remote.rmAll({})
      await expect(result).to.eventually.be.rejectedWith(/service name must be passed/)
    })

    it('noop if there is no match', async () => {
      await ipfs.pin.remote.rmAll({
        cid: [cid1],
        status: ['pinned', 'failed'],
        service: SERVICE
      })

      const list = await all(ipfs.pin.remote.ls({
        status: ['queued', 'pinning', 'pinned', 'failed'],
        service: SERVICE
      }))

      expect(list.sort(byCID)).to.deep.equal([
        {
          cid: cid1,
          status: 'queued',
          name: 'queued-a'
        },
        {
          cid: cid2,
          status: 'pinning',
          name: 'pinning-b'
        },
        {
          cid: cid3,
          status: 'pinned',
          name: 'pinned-c'
        },
        {
          cid: cid4,
          status: 'failed',
          name: 'failed-d'
        }
      ].sort(byCID))
    })

    it('removes matching pin', async () => {
      await ipfs.pin.remote.rmAll({
        cid: [cid1],
        status: ['queued', 'pinning', 'pinned', 'failed'],
        service: SERVICE
      })

      const list = await all(ipfs.pin.remote.ls({
        status: ['queued', 'pinning', 'pinned', 'failed'],
        service: SERVICE
      }))

      expect(list.sort(byCID)).to.deep.equal([
        {
          cid: cid2,
          status: 'pinning',
          name: 'pinning-b'
        },
        {
          cid: cid3,
          status: 'pinned',
          name: 'pinned-c'
        },
        {
          cid: cid4,
          status: 'failed',
          name: 'failed-d'
        }
      ].sort(byCID))
    })

    it('removes multiple matches', async () => {
      const result = ipfs.pin.remote.rmAll({
        cid: [cid1, cid2],
        status: ['queued', 'pinning', 'pinned', 'failed'],
        service: SERVICE
      })
      await expect(result).to.eventually.be.equal(undefined)

      const list = await all(ipfs.pin.remote.ls({
        status: ['queued', 'pinning', 'pinned', 'failed'],
        service: SERVICE
      }))

      expect(list.sort(byCID)).to.deep.equal([
        {
          cid: cid3,
          status: 'pinned',
          name: 'pinned-c'
        },
        {
          cid: cid4,
          status: 'failed',
          name: 'failed-d'
        }
      ].sort(byCID))
    })
  })
}
