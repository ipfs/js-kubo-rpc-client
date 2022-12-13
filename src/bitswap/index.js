import { createWantlist } from './wantlist.js'
import { createWantlistForPeer } from './wantlist-for-peer.js'
import { createStat } from './stat.js'

/**
 * @param {import('../types').Options} config
 */
export function createBitswap (config) {
  return {
    /**
     * TODO: Add bitswap.ledger
     * TODO: Add bitswap.reprovide
     * TODO: Remove bitswap.wantlistForPeer
     */
    wantlist: createWantlist(config),
    wantlistForPeer: createWantlistForPeer(config),
    stat: createStat(config)
  }
}
