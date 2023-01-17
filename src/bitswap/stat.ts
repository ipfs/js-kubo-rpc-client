import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'
import type { Stats } from './index.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createStat (client: Client) {
  async function stat (options?: ClientOptions): Promise<Stats> {
    const res = await client.post('bitswap/stat', {
      searchParams: toUrlSearchParams(options),
      signal: options?.signal,
      headers: options?.headers
    })

    return toCoreInterface(await res.json())
  }

  return stat
}

function toCoreInterface (res: any): Stats {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist ?? []).map((k: Record<string, any>) => CID.parse(k['/'])),
    peers: (res.Peers ?? []).map((str: string) => peerIdFromString(str)),
    blocksReceived: BigInt(res.BlocksReceived),
    dataReceived: BigInt(res.DataReceived),
    blocksSent: BigInt(res.BlocksSent),
    dataSent: BigInt(res.DataSent),
    dupBlksReceived: BigInt(res.DupBlksReceived),
    dupDataReceived: BigInt(res.DupDataReceived)
  }
}
