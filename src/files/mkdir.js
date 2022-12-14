import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createMkdir = configure(api => {
  /**
   * @type {import('../types').FilesAPI["mkdir"]}
   */
  async function mkdir (path, options = {}) {
    const res = await api.post('files/mkdir', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
  return mkdir
})
