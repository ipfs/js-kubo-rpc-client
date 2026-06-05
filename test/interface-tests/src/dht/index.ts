import { createSuite } from '../utils/suite.ts'
import { testDisabled } from './disabled.ts'
import { testQuery } from './query.ts'

const tests = {
  query: testQuery,
  disabled: testDisabled
}

export default createSuite(tests)
