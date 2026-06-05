import { createSuite } from '../utils/suite.ts'
import { testCancel } from './cancel.ts'
import { testPubsub } from './pubsub.ts'
import { testState } from './state.ts'
import { testSubs } from './subs.ts'

const tests = {
  cancel: testCancel,
  state: testState,
  subs: testSubs,
  pubsub: testPubsub
}

export default createSuite(tests)
