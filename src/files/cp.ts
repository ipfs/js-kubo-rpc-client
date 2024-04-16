import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createCp = configure(api => {
  /**
   * @type {import('../types').FilesAPI["cp"]}
   */
  async function cp (sources, destination, options = {}) {
    /** @type {import('../types').IPFSPath[]} */
    const sourceArr = Array.isArray(sources) ? sources : [sources]

    const res = await api.post('files/cp', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sourceArr.concat(destination).map(src => CID.asCID(src) ? `/ipfs/${src}` : src),
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
  return cp
})
