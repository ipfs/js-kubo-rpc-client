import type { PBNode } from '@ipld/dag-pb'
import type { CID } from 'multiformats/cid'
import type { KuboClient } from '../../../../src'

export async function * traverseLeafNodes (ipfs: KuboClient, cid: CID) {
  async function * traverse (cid: CID): AsyncIterable<{ node: PBNode, cid: CID }> {
    const { value: node } = await ipfs.dag.get(cid)

    if (node instanceof Uint8Array || node.Links.length === 0) {
      yield {
        node,
        cid
      }

      return
    }

    for (const link of node.Links) {
      yield * traverse(link.Hash)
    }
  }

  yield * traverse(cid)
}
