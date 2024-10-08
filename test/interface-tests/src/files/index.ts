import { createSuite } from '../utils/suite.js'
import { testCp } from './cp.js'
import { testFlush } from './flush.js'
import { testLs } from './ls.js'
import { testMkdir } from './mkdir.js'
import { testMv } from './mv.js'
import { testRead } from './read.js'
import { testRm } from './rm.js'
import { testStat } from './stat.js'
import { testWrite } from './write.js'

const tests = {
  cp: testCp,
  flush: testFlush,
  ls: testLs,
  mkdir: testMkdir,
  mv: testMv,
  read: testRead,
  rm: testRm,
  stat: testStat,
  write: testWrite
}

export default createSuite(tests)
