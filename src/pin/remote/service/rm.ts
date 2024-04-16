import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'

/**
 * @param {import('../../../lib/core').Client} client
 */
export function createRm (client) {
  /**
   * @type {import('../../../types').RemotePiningServiceAPI["rm"]}
   */
  async function rm (name, options = {}) {
    await client.post('pin/remote/service/rm', {
      signal: options.signal,
      headers: options.headers,
      searchParams: toUrlSearchParams({
        arg: name
      })
    })
  }

  return rm
}
