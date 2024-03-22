import { UnixFS } from 'ipfs-unixfs'
import type { CID } from 'multiformats/cid'
import type { KuboClient } from '../../../../src'

export default async function dumpShard (path: string, ipfs: KuboClient) {
  const stats = await ipfs.files.stat(path)
  const { value: node } = await ipfs.dag.get(stats.cid)
  const entry = UnixFS.unmarshal(node.Data)

  if (entry.type !== 'hamt-sharded-directory') {
    throw new Error('Not a shard')
  }

  await dumpSubShard(stats.cid, ipfs)
}

async function dumpSubShard (cid: CID, ipfs: KuboClient, prefix: string = '') {
  const { value: node } = await ipfs.dag.get(cid)
  const entry = UnixFS.unmarshal(node.Data)

  if (entry.type !== 'hamt-sharded-directory') {
    throw new Error('Not a shard')
  }

  for (const link of node.Links) {
    const { value: subNode } = await ipfs.dag.get(link.Hash)
    const subEntry = UnixFS.unmarshal(subNode.Data)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, no-console
    console.info(`${prefix}${link.Name}`, ' ', subEntry.type)

    if (link.Name.length === 2) {
      await dumpSubShard(link.Hash, ipfs, `${prefix}  `)
    }
  }
}
