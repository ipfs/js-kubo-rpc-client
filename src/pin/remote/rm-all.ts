import { encodeQuery } from './utils.js'

/**
 * @param {import('../../lib/core').Client} client
 */
export function createRmAll (client) {
  /**
   * @type {import('../../types').RemotePiningAPI["rmAll"]}
   */
  async function rmAll ({ timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: true
      })
    })
  }

  return rmAll
}
