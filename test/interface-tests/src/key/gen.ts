/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { keys } from '@libp2p/crypto'

const { supportedKeys, import: importKey } = keys

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testGen (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.gen', () => {
    const keyTypes = [
      {
        opts: { type: 'rsa', size: 2048 },
        expectedType: supportedKeys.rsa.RsaPrivateKey
      },
      {
        opts: { type: 'ed25519' },
        expectedType: supportedKeys.ed25519.Ed25519PrivateKey
      },
      {
        opts: { },
        expectedType: supportedKeys.ed25519.Ed25519PrivateKey
      }
    ]

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.opts.type || 'default'} key`, async function () {
        // @ts-ignore this is mocha
        this.timeout(20 * 1000)
        const name = nanoid()
        const key = await ipfs.key.gen(name, kt.opts)
        expect(key).to.exist()
        expect(key).to.have.property('name', name)
        expect(key).to.have.property('id')

        try {
          const password = nanoid() + '-' + nanoid()
          const exported = await ipfs.key.export(name, password)
          const imported = await importKey(exported, password)

          expect(imported).to.be.an.instanceOf(kt.expectedType)
        } catch (/** @type {any} */ err) {
          if (err.code === 'ERR_NOT_IMPLEMENTED') {
            // key export is not exposed over the HTTP API
            // @ts-ignore this is mocha
            this.skip('Cannot verify key type')
          }

          throw err
        }
      })
    })
  })
}
