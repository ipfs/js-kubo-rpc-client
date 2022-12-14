import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createCmds = configure(api => {
  /**
   * @type {import('../types').DiagAPI["cmds"]}
   */
  async function cmds (options = {}) {
    const res = await api.post('diag/cmds', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
  return cmds
})
