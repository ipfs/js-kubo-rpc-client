import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createDns = configure(api => {
  /**
   * @type {import('./types').RootAPI["dns"]}
   */
  const dns = async (domain, options = {}) => {
    const res = await api.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: domain,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Path
  }

  return dns
})
