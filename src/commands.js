import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createCommands = configure(api => {
  /**
   * @type {import('./types').RootAPI["commands"]}
   */
  const commands = async (options = {}) => {
    const res = await api.post('commands', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
  return commands
})
