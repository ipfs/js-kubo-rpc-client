/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { randomBytes } from 'iso-random-stream'
import { nanoid } from 'nanoid'
import { createShardedDirectory } from '../utils/create-sharded-directory.js'
import { createTwoShards } from '../utils/create-two-shards.js'
import isShardAtPath from '../utils/is-shard-at-path.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testRm (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.rm', function () {
    this.timeout(300 * 1000)

    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should not remove not found file/dir, expect error', () => {
      const testDir = `/test-${nanoid()}`

      return expect(ipfs.files.rm(`${testDir}/a`)).to.eventually.be.rejected()
    })

    it('refuses to remove files without arguments', async () => {
      // @ts-expect-error invalid args
      await expect(ipfs.files.rm()).to.eventually.be.rejected()
    })

    it('refuses to remove the root path', async () => {
      await expect(ipfs.files.rm('/')).to.eventually.be.rejected()
    })

    it('refuses to remove a directory without the recursive flag', async () => {
      const path = `/directory-${Math.random()}.txt`

      await ipfs.files.mkdir(path)

      await expect(ipfs.files.rm(path)).to.eventually.be.rejectedWith(/use -r to remove directories/)
    })

    it('refuses to remove a non-existent file', async () => {
      await expect(ipfs.files.rm(`/file-${Math.random()}`)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('removes a file', async () => {
      const file = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, randomBytes(100), {
        create: true,
        parents: true
      })

      await ipfs.files.rm(file)

      await expect(ipfs.files.stat(file)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('removes a directory', async () => {
      const directory = `/directory-${Math.random()}`

      await ipfs.files.mkdir(directory)
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a directory', async () => {
      const directory = `/directory-${Math.random()}`
      const subdirectory = `/directory-${Math.random()}`
      const path = `${directory}${subdirectory}`

      await ipfs.files.mkdir(path, {
        parents: true
      })
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(path)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a directory with files in', async () => {
      const directory = `/directory-${Math.random()}`
      const file = `${directory}/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(file)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    describe('with sharding', () => {
      let ipfs: KuboRPCClient

      before(async function () {
        const ipfsd = await factory.spawn({
          ipfsOptions: {
            EXPERIMENTAL: {
              // enable sharding for js
              sharding: true
            },
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

      it('recursively removes a sharded directory inside a normal directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const dir = `dir-${Math.random()}`
        const dirPath = `/${dir}`

        await ipfs.files.mkdir(dirPath)

        await ipfs.files.mv(shardedDirPath, dirPath)

        const finalShardedDirPath = `${dirPath}${shardedDirPath}`

        await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
        expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')

        await ipfs.files.rm(dirPath, {
          recursive: true
        })

        await expect(ipfs.files.stat(dirPath)).to.eventually.be.rejectedWith(/does not exist/)
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.be.rejectedWith(/does not exist/)
      })

      it('recursively removes a sharded directory inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const otherDirPath = await createShardedDirectory(ipfs)

        await ipfs.files.mv(shardedDirPath, otherDirPath)

        const finalShardedDirPath = `${otherDirPath}${shardedDirPath}`

        await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
        expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')
        await expect(isShardAtPath(otherDirPath, ipfs)).to.eventually.be.true()
        expect((await ipfs.files.stat(otherDirPath)).type).to.equal('directory')

        await ipfs.files.rm(otherDirPath, {
          recursive: true
        })

        await expect(ipfs.files.stat(otherDirPath)).to.eventually.be.rejectedWith(/does not exist/)
        await expect(ipfs.files.stat(finalShardedDirPath)).to.eventually.be.rejectedWith(/does not exist/)
      })
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 1001)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 31)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 2187)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 139)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })
  })
}
