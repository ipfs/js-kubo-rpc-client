import { createWantlist } from './wantlist.js'
import { createWantlistForPeer } from './wantlist-for-peer.js'
import { createStat } from './stat.js'

/**
 * @param {import('../types').Options} config
 */
export function createBitswap (config) {
  return {
    /**
     * TODO: https://github.com/ipfs/js-kubo-rpc-client/issues/99
     */
    wantlist: createWantlist(config),
    wantlistForPeer: createWantlistForPeer(config),
    stat: createStat(config)
  }
}
