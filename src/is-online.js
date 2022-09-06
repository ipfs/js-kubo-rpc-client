import { createId } from './id.js'

/**
 * @param {import('./types').Options} options
 */
export const createIsOnline = options => {
  const id = createId(options)

  /**
   * @type {import('./types').RootAPI["isOnline"]}
   */
  async function isOnline (options = {}) {
    const res = await id(options)

    return Boolean(res && res.addresses && res.addresses.length)
  }
  return isOnline
}
