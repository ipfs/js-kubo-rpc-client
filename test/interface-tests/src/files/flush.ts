/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'
export function testFlush (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.flush', function () {
    this.timeout(120 * 1000)

    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should not flush not found file/dir, expect error', async () => {
      const testDir = `/test-${nanoid()}`

      try {
        await ipfs.files.flush(`${testDir}/404`)
      } catch (err: any) {
        expect(err).to.exist()
      }
    })

    it('should require a path', async () => {
      // @ts-expect-error invalid args
      await expect(ipfs.files.flush()).to.eventually.be.rejected()
    })

    it('should flush root', async () => {
      const root = await ipfs.files.stat('/')
      const flushed = await ipfs.files.flush('/')

      expect(root.cid.toString()).to.equal(flushed.toString())
    })

    it('should flush specific dir', async () => {
      const testDir = `/test-${nanoid()}`

      await ipfs.files.mkdir(testDir, { parents: true })

      const dirStats = await ipfs.files.stat(testDir)
      const flushed = await ipfs.files.flush(testDir)

      expect(dirStats.cid.toString()).to.equal(flushed.toString())
    })
  })
}
