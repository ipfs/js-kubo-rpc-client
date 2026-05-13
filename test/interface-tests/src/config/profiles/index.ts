import { createSuite } from '../../utils/suite.ts'
import { testApply } from './apply.ts'

const tests = {
  apply: testApply
}

export default createSuite(tests, 'config')
