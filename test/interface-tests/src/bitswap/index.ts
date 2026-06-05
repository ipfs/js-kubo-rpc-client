import { createSuite } from '../utils/suite.ts'
import { testStat } from './stat.ts'
import { testWantlistForPeer } from './wantlist-for-peer.ts'
import { testWantlist } from './wantlist.ts'

const tests = {
  stat: testStat,
  wantlist: testWantlist,
  wantlistForPeer: testWantlistForPeer
}

export default createSuite(tests)
