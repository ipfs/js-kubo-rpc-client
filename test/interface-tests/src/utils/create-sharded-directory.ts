import { expect } from 'aegir/chai'
import last from 'it-last'
import isShardAtPath from './is-shard-at-path.js'
import type { KuboRPCClient } from '../../../../src/index.js'

export async function createShardedDirectory (ipfs: KuboRPCClient, files: number = 1001): Promise<string> {
  const dirPath = `/sharded-dir-${Math.random()}`

  const result = await last(ipfs.addAll((function * () {
    for (let i = 0; i < files; i++) {
      yield {
        path: `${dirPath}/file-${i}`,
        content: Uint8Array.from([0, 1, 2, 3, 4, 5, i])
      }
    }
  }()), {
    preload: false,
    pin: false
  }))

  if (result == null) {
    throw new Error('No result received from ipfs.addAll')
  }

  await ipfs.files.cp(`/ipfs/${result.cid}`, dirPath)

  await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true('Tried to create a shared directory but the result was not a shard')

  return dirPath
}
