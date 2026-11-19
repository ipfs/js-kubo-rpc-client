import { createWantlist } from './wantlist.ts'
import type { BitswapAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createWantlistForPeer (client: HTTPRPCClient): BitswapAPI['wantlistForPeer'] {
  const wantlist = createWantlist(client)
  return async function wantlistForPeer (peerId, options = {}) {
    return wantlist({ ...options, peer: peerId })
  }
}
