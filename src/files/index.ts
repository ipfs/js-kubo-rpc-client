import { createCp } from './cp.js'
import { createFlush } from './flush.js'
import { createLs } from './ls.js'
import { createMkdir } from './mkdir.js'
import { createMv } from './mv.js'
import { createRead } from './read.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'
import { createWrite } from './write.js'

/**
 * @param {import('../types').Options} config
 */
export function createFiles (config) {
  return {
    cp: createCp(config),
    flush: createFlush(config),
    ls: createLs(config),
    mkdir: createMkdir(config),
    mv: createMv(config),
    read: createRead(config),
    rm: createRm(config),
    stat: createStat(config),
    write: createWrite(config)
  }
}
