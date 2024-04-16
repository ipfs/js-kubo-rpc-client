import { createAddAll } from './add-all.js'
import last from 'it-last'
import { configure } from './lib/configure.js'
import { normaliseInput } from 'ipfs-core-utils/files/normalise-input-single'

/**
 * @param {import('./types').Options} options
 */
export function createAdd (options) {
  const all = createAddAll(options)
  return configure(() => {
    /**
     * @type {import('./types').RootAPI["add"]}
     */
    async function add (input, options = {}) {
      const source = normaliseInput(input)
      // @ts-expect-error - all may return undefined if source is empty
      const addAllPromise = all(source, options)
      // @ts-expect-error - last may return undefined if source is empty
      return await last(addAllPromise)
    }
    return add
  })(options)
}
