import { createSuite } from '../utils/suite.js'
import { testStat } from './stat.js'
import { testWantlist } from './wantlist.js'
import { testWantlistForPeer } from './wantlist-for-peer.js'
import { testTransfer } from './transfer.js'

const tests = {
  stat: testStat,
  wantlist: testWantlist,
  wantlistForPeer: testWantlistForPeer,
  transfer: testTransfer
}

export default createSuite(tests)
