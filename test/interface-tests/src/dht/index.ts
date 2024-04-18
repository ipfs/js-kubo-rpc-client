import { createSuite } from '../utils/suite.js'
import { testDisabled } from './disabled.js'
import { testQuery } from './query.js'

const tests = {
  query: testQuery,
  disabled: testDisabled
}

export default createSuite(tests)
