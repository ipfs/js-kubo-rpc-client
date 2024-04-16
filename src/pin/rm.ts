import { createRmAll } from './rm-all.js'
import last from 'it-last'
import { configure } from '../lib/configure.js'

/**
 * @param {import('../types').Options} config
 */
export const createRm = (config) => {
  const all = createRmAll(config)

  return configure(() => {
    /**
     * @type {import('../types').PinAPI["rm"]}
     */
    async function rm (path, options = {}) {
      // @ts-expect-error last can return undefined
      return last(all([{
        path,
        ...options
      }], options))
    }
    return rm
  })(config)
}
