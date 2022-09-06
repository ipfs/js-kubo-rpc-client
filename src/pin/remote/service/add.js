import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { encodeEndpoint } from './utils.js'

/**
 * @param {import('../../../lib/core').Client} client
 */
export function createAdd (client) {
  /**
   * @type {import('../../../types').RemotePiningServiceAPI["add"]}
   */
  async function add (name, options) {
    const { endpoint, key, headers, timeout, signal } = options

    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [name, encodeEndpoint(endpoint), key]
      }),
      headers
    })
  }

  return add
}
