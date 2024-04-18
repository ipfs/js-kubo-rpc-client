import { createSuite } from '../../utils/suite.js'
import { testAddLink } from './add-link.js'
import { testRmLink } from './rm-link.js'

const tests = {
  addLink: testAddLink,
  rmLink: testRmLink
}

export default createSuite(tests, 'patch')
