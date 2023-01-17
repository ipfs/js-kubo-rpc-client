import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import { abortSignal } from '../../lib/abort-signal.js'
import type { ClientOptions } from '../../index.js'
import type { Client } from '../../lib/core.js'

export function createSetData (client: Client) {
  async function setData (cid: CID, data: Uint8Array, options?: ClientOptions): Promise<CID> {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    const res = await client.post('object/patch/set-data', {
      signal,
      searchParams: toUrlSearchParams({
        arg: [
          cid.toString()
        ],
        ...options
      }),
      ...(
        await multipartRequest([data], controller, options?.headers)
      )
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }

  return setData
}
