/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KeyType } from '../../../../src/key/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

interface KeyTest {
  opts: {
    type?: KeyType
    size?: number
  }
}

export function testGen (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.gen', () => {
    const keyTypes: KeyTest[] = [
      {
        opts: { type: 'ed25519' }
      },
      {
        opts: { }
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
