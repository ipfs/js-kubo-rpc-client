import { encodeAddParams, decodePin } from './utils.js'

/**
 * @param {import('../../lib/core').Client} client
 */
export function createAdd (client) {
  /**
   * @type {import('../../types').RemotePiningAPI["add"]}
   */
  async function add (cid, { timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/add', {
      timeout,
      signal,
      headers,
      searchParams: encodeAddParams({ cid, ...query })
    })

    return decodePin(await response.json())
  }

  return add
}
