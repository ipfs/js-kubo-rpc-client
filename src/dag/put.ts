import { anySignal } from 'any-signal'
import { CID } from 'multiformats/cid'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { DAGAPI, DAGPutOptions } from './index.js'
import type { Codecs } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createPut (client: HTTPRPCClient, codecs: Codecs): DAGAPI['put'] {
  return async function put (dagNode, options = {}) {
    const settings: DAGPutOptions = {
      storeCodec: 'dag-cbor',
      hashAlg: 'sha2-256',
      ...options
    }

    let serialized

    if (settings.inputCodec != null) {
      // if you supply an inputCodec, we assume you're passing in a raw, encoded
      // block using that codec, so we'll just pass that on to the server and let
      // it deal with the decode/encode/store cycle
      if (!(dagNode instanceof Uint8Array)) {
        throw new Error('Can only inputCodec on raw bytes that can be decoded')
      }
      serialized = dagNode
    } else {
      // if you don't supply an inputCodec, we assume you've passed in a JavaScript
      // object you want to have encoded using storeCodec, so we'll prepare it for
      // you if we have the codec
      const storeCodec = await codecs.getCodec(settings.storeCodec ?? 'dag-cbor')
      serialized = storeCodec.encode(dagNode)
      // now we have a serialized form, the server should be told to receive it
      // in that format
      settings.inputCodec = settings.storeCodec
    }

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, settings.signal])

    try {
      const res = await client.post('dag/put', {
        timeout: settings.timeout,
        signal,
        searchParams: toUrlSearchParams(settings),
        ...(
          await multipartRequest([serialized], controller, settings.headers)
        )
      })
      const data = await res.json()

      return CID.parse(data.Cid['/'])
    } finally {
      signal.clear()
    }
  }
}
