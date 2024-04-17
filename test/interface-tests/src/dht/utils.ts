import delay from 'delay'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { KuboRPCClient } from '../../../../src/index.js'

export async function fakeCid (data?: Uint8Array): Promise<CID> {
  const bytes = data ?? uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await sha256.digest(bytes)
  return CID.createV0(mh)
}

export async function ensureReachable (nodeA: KuboRPCClient, nodeB: KuboRPCClient): Promise<void> {
  async function canFindOnDHT (source: KuboRPCClient, target: KuboRPCClient): Promise<void> {
    const { id } = await target.id()

    for await (const event of source.dht.query(id)) {
      if (event.name === 'PEER_RESPONSE' && event.from?.toString() === id.toString()) {
        return
      }
    }

    throw new Error(`Could not find ${id} in DHT`)
  }

  const nodeBId = await nodeB.id()
  await nodeA.swarm.connect(nodeBId.addresses[0])

  while (true) {
    try {
      await Promise.all([
        canFindOnDHT(nodeA, nodeB),
        canFindOnDHT(nodeB, nodeA)
      ])

      break
    } catch {
      await delay(1000)
    }
  }
}
