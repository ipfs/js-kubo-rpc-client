/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { randomBytes } from 'iso-random-stream'
import all from 'it-all'
import drain from 'it-drain'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { createShardedDirectory } from '../utils/create-sharded-directory.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRead (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)
  const smallFile = randomBytes(13)

  describe('.files.read', function () {
    this.timeout(120 * 1000)

    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('reads a small file', async () => {
      const filePath = '/small-file.txt'

      await ipfs.files.write(filePath, smallFile, {
        create: true
      })

      const bytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

      expect(bytes).to.deep.equal(smallFile)
    })

    it('reads a file with an offset', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const offset = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const bytes = uint8ArrayConcat(await all(ipfs.files.read(path, {
        offset
      })))

      expect(bytes).to.deep.equal(data.slice(offset))
    })

    it('reads a file with a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const bytes = uint8ArrayConcat(await all(ipfs.files.read(path, {
        length
      })))

      expect(bytes).to.deep.equal(data.slice(0, length))
    })

    it('reads a file with an offset and a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const offset = 10
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = uint8ArrayConcat(await all(ipfs.files.read(path, {
        offset,
        length
      })))

      expect(buffer).to.deep.equal(data.slice(offset, offset + length))
    })

    it('refuses to read a directory', async () => {
      const path = '/'

      await expect(drain(ipfs.files.read(path))).to.eventually.be.rejectedWith(/not a file/)
    })

    it('refuses to read a non-existent file', async () => {
      const path = `/file-${Math.random()}.txt`

      await expect(drain(ipfs.files.read(path))).to.eventually.be.rejectedWith(/does not exist/)
    })

    describe('with sharding', () => {
      let ipfs: KuboRPCClient

      before(async function () {
        const ipfsd = await factory.spawn({
          init: {
            config: {
              // enable sharding for go with automatic threshold dropped to the minimum so it shards everything
              Internal: {
                UnixFSShardingSizeThreshold: '1B'
              }
            }
          }
        })
        ipfs = ipfsd.api
      })

      it('reads file from inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const filePath = `${shardedDirPath}/file-${Math.random()}.txt`
        const content = Uint8Array.from([0, 1, 2, 3, 4])

        await ipfs.files.write(filePath, content, {
          create: true
        })

        const bytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

        expect(bytes).to.deep.equal(content)
      })
    })
  })
}
