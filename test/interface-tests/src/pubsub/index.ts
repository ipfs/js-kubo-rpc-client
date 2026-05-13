import { createSuite } from '../utils/suite.ts'
import { testLs } from './ls.ts'
import { testPeers } from './peers.ts'
import { testPublish } from './publish.ts'
import { testSubscribe } from './subscribe.ts'
import { testUnsubscribe } from './unsubscribe.ts'

const tests = {
  publish: testPublish,
  subscribe: testSubscribe,
  unsubscribe: testUnsubscribe,
  peers: testPeers,
  ls: testLs
}

export default createSuite(tests)
