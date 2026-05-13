import { createSuite } from '../utils/suite.ts'
import { testPing } from './ping.ts'

const tests = {
  ping: testPing
}

export default createSuite(tests)
