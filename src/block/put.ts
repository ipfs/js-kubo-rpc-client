import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import type { PutOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createPut (client: Client) {
  async function put (data: Uint8Array, options?: PutOptions): Promise<CID> {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    let res
    try {
      const response = await client.post('block/put', {
        signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest([data], controller, options?.headers)
        )
      })
      res = await response.json()
    } catch (err: any) {
      // Retry with "protobuf"/"cbor" format for go-ipfs
      // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
      if (options?.format === 'dag-pb') {
        return await put(data, { ...options, format: 'protobuf' })
      } else if (options?.format === 'dag-cbor') {
        return await put(data, { ...options, format: 'cbor' })
      }

      throw err
    }

    return CID.parse(res.Key)
  }

  return put
}
