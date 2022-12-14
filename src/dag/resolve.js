import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createResolve = configure(api => {
  /**
   * @type {import('../types.js').DAGAPI["resolve"]}
   */
  const resolve = async (ipfsPath, options = {}) => {
    const res = await api.post('dag/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ipfsPath}${options.path ? `/${options.path}`.replace(/\/[/]+/g, '/') : ''}`,
        ...options
      }),
      headers: options.headers
    })

    const data = await res.json()

    return { cid: CID.parse(data.Cid['/']), remainderPath: data.RemPath }
  }

  return resolve
})
