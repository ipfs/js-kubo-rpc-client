import { peerIdFromString } from '@libp2p/peer-id'
import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { BitswapStats, BitswapAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createStat (client: HTTPRPCClient): BitswapAPI['stat'] {
  return async function stat (options = {}) {
    const res = await client.post('bitswap/stat', {
      searchParams: toUrlSearchParams(options),
      signal: options.signal,
      headers: options.headers
    })

    return toCoreInterface(await res.json())
  }
}

function toCoreInterface (res: any): BitswapStats {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist ?? []).map((k: any) => CID.parse(k['/'])),
    peers: (res.Peers ?? []).map((str: any) => peerIdFromString(str)),
    blocksReceived: BigInt(res.BlocksReceived),
    dataReceived: BigInt(res.DataReceived),
    blocksSent: BigInt(res.BlocksSent),
    dataSent: BigInt(res.DataSent),
    dupBlksReceived: BigInt(res.DupBlksReceived),
    dupDataReceived: BigInt(res.DupDataReceived)
  }
}
