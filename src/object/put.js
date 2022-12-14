import { configure } from '../lib/configure.js'
import { createPut as createDagPut } from '../dag/put.js'

/**
 * @param {import('../types').Multicodecs} codecs
 * @param {import('../types').Options} options
 */
export const createPut = (codecs, options) => {
  const fn = configure((api) => {
    const dagPut = createDagPut(codecs, options)

    /**
     * @type {import('../types').ObjectAPI["put"]}
     */
    async function put (obj, options = {}) {
      return dagPut(obj, {
        ...options,
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256',
        version: 1
      })
    }
    return put
  })

  return fn(options)
}
