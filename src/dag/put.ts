import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import type { Multicodecs } from '../index.js'
import type { PutOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createPut (codecs: Multicodecs, client: Client) {
  const put = async (dagNode: any, options?: PutOptions): Promise<CID> => {
    const settings = {
      storeCodec: 'dag-cbor',
      hashAlg: 'sha2-256',
      ...options
    }

    let serialized

    if (settings?.inputCodec != null) {
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
      const storeCodec = await codecs.getCodec(settings.storeCodec)
      serialized = storeCodec.encode(dagNode)
      // now we have a serialized form, the server should be told to receive it
      // in that format
      settings.inputCodec = settings.storeCodec
    }

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, settings.signal)

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
  }

  return put
}