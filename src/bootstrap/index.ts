import { createAdd } from './add.js'
import { createList } from './list.js'
import { createRm } from './rm.js'

/**
 * @param {import('../types').Options} config
 */
export function createBootstrap (config) {
  return {
    add: createAdd(config),
    list: createList(config),
    rm: createRm(config)
  }
}
