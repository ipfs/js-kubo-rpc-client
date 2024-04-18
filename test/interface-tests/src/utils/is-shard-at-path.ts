import { UnixFS } from 'ipfs-unixfs'
import type { KuboRPCClient } from '../../../../src/index.js'

export default async function isShardAtPath (path: string, ipfs: KuboRPCClient): Promise<boolean> {
  const stats = await ipfs.files.stat(path)
  const { value: node } = await ipfs.dag.get(stats.cid)
  const entry = UnixFS.unmarshal(node.Data)

  return entry.type === 'hamt-sharded-directory'
}
