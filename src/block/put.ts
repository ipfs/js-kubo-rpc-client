import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'

export const createPut = configure((api, configOptions) => {
  /**
   * @type {import('../types').BlockAPI["put"]}
   * @see https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-block-put
   */
  async function put (data, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    let res
    try {
      const response = await api.post('block/put', {
        signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest([data], controller, options.headers)
        )
      })
      res = await response.json()
    } catch (/** @type {any} */ err) {
      // Retry with "protobuf"/"cbor" format for go-ipfs
      // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
      if (options.format === 'dag-pb') {
        return put(data, { ...options, format: 'protobuf' })
      } else if (options.format === 'dag-cbor') {
        return put(data, { ...options, format: 'cbor' })
      }

      throw err
    }

    return CID.parse(res.Key)
  }

  return put
})
