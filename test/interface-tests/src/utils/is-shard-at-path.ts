import { UnixFS } from 'ipfs-unixfs'
import type { KuboClient } from '../../../../src'

export default async function isShardAtPath (path: string, ipfs: KuboClient) {
  const stats = await ipfs.files.stat(path)
  const { value: node } = await ipfs.dag.get(stats.cid)
  const entry = UnixFS.unmarshal(node.Data)

  return entry.type === 'hamt-sharded-directory'
}
