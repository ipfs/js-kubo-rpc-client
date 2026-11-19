import { parse } from '@ipld/dag-json'
import { peerIdFromString } from '@libp2p/peer-id'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BitswapAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

interface LedgerResponse {
  Peer: string
  Value: number
  Sent: number | bigint
  Recv: number | bigint
  Exchanged: number | bigint
}

export function createLedger (client: HTTPRPCClient): BitswapAPI['ledger'] {
  return async function ledger (peerId, options = {}) {
    const res = await client.post('bitswap/ledger', {
      signal: options.signal,
      searchParams: toUrlSearchParams({ arg: peerId.toString(), ...options }),
      headers: options.headers
    })
    // JSON.parse rounds uint64 counters before BigInt can recover them.
    const data = parse<LedgerResponse>(await res.text())

    return {
      peer: peerIdFromString(data.Peer),
      value: data.Value,
      sent: BigInt(data.Sent),
      recv: BigInt(data.Recv),
      exchanged: BigInt(data.Exchanged)
    }
  }
}
