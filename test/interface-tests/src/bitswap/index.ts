import { createSuite } from '../utils/suite.js'
import { testStat } from './stat.js'
import { testWantlistForPeer } from './wantlist-for-peer.js'
import { testWantlist } from './wantlist.js'

const tests = {
  stat: testStat,
  wantlist: testWantlist,
  wantlistForPeer: testWantlistForPeer
}

export default createSuite(tests)
