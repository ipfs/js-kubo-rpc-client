import { createSuite } from '../utils/suite.ts'
import { testCp } from './cp.ts'
import { testFlush } from './flush.ts'
import { testLs } from './ls.ts'
import { testMkdir } from './mkdir.ts'
import { testMv } from './mv.ts'
import { testRead } from './read.ts'
import { testRm } from './rm.ts'
import { testStat } from './stat.ts'
import { testWrite } from './write.ts'

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
