import { createSuite } from '../utils/suite.js'
import { testCancel } from './cancel.js'
import { testPubsub } from './pubsub.js'
import { testState } from './state.js'
import { testSubs } from './subs.js'

const tests = {
  cancel: testCancel,
  state: testState,
  subs: testSubs,
  pubsub: testPubsub
}

export default createSuite(tests)
