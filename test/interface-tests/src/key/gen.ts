/* eslint-env mocha */

import { keys } from '@libp2p/crypto'
import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KeyType } from '../../../../src/key/index.js'
import type { KuboRPCFactory } from '../index.js'

const { supportedKeys } = keys

interface KeyTest {
  opts: {
    type?: KeyType
    size?: number
  }
  expectedType: any
}

export function testGen (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.gen', () => {
    const keyTypes: KeyTest[] = [
      {
        opts: { type: 'ed25519' },
        expectedType: supportedKeys.ed25519.Ed25519PrivateKey
      },
      {
        opts: { },
        expectedType: supportedKeys.ed25519.Ed25519PrivateKey
      }
    ]

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.opts.type ?? 'default'} key`, async function () {
        this.timeout(20 * 1000)
        const name = nanoid()
        const key = await ipfs.key.gen(name, kt.opts)
        expect(key).to.exist()
        expect(key).to.have.property('name', name)
        expect(key).to.have.property('id')
      })
    })
  })
}
