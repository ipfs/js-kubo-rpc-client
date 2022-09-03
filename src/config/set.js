import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createSet = configure(api => {
  /**
   * @type {import('../types.js').ConfigAPI["set"]}
   */
  const set = async (key, value, options = {}) => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const params = {
      ...options,
      ...encodeParam(key, value)
    }

    const res = await api.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams(params),
      headers: options.headers
    })

    await res.text()
  }

  return set
})

/**
 * @param {*} key
 * @param {*} value
 */
const encodeParam = (key, value) => {
  switch (typeof value) {
    case 'boolean':
      return { arg: [key, value.toString()], bool: true }
    case 'string':
      return { arg: [key, value] }
    default:
      return { arg: [key, JSON.stringify(value)], json: true }
  }
}
