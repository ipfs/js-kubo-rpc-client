import { CID } from 'multiformats/cid'
import { objectToCamelWithMetadata } from '../lib/object-to-camel-with-metadata.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createLs = configure(api => {
  /**
   * @type {import('../types').FilesAPI["ls"]}
   */
  async function * ls (path, options = {}) {
    if (!path) {
      throw new Error('ipfs.files.ls requires a path')
    }

    const res = await api.post('files/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: CID.asCID(path) ? `/ipfs/${path}` : path,
        // default long to true, diverges from go-ipfs where its false by default
        long: true,
        ...options,
        stream: true
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      // go-ipfs does not yet support the "stream" option
      if ('Entries' in result) {
        for (const entry of result.Entries || []) {
          yield toCoreInterface(objectToCamelWithMetadata(entry))
        }
      } else {
        yield toCoreInterface(objectToCamelWithMetadata(result))
      }
    }
  }
  return ls
})

/**
 * @param {*} entry
 */
function toCoreInterface (entry) {
  if (entry.hash) {
    entry.cid = CID.parse(entry.hash)
  }

  delete entry.hash

  entry.type = entry.type === 1 ? 'directory' : 'file'

  return entry
}
