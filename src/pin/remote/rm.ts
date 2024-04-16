import { encodeQuery } from './utils.js'

/**
 * @param {import('../../lib/core').Client} client
 */
export function createRm (client) {
  /**
   * @type {import('../../types').RemotePiningAPI["rm"]}
   */
  async function rm ({ timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: false
      })
    })
  }

  return rm
}
