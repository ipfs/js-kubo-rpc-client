import { Buffer } from 'node:buffer'
// @ts-expect-error no types
import toStream from 'it-to-stream'
import { fetch, Request, Response, Headers } from '../fetch.js'
import type { UploadProgressFn } from '../../index.js'
import type { FetchOptions } from '../http.js'
import type { Readable } from 'node:stream'

const fetchWithProgress = async (url: string | Request, options: FetchOptions = {}): Promise<Response> =>
  fetch(url, withUploadProgress(options))

/**
 * Takes fetch options and wraps request body to track upload progress if
 * `onUploadProgress` is supplied. Otherwise returns options as is.
 *
 * @param {FetchOptions} options
 * @returns {FetchOptions}
 */
const withUploadProgress = (options: FetchOptions): FetchOptions => {
  const { onUploadProgress, body } = options
  if (onUploadProgress != null && body != null) {
    // This works around the fact that electron-fetch serializes `Uint8Array`s
  // and `ArrayBuffer`s to strings.
    const content = normalizeBody(body)

    const rsp = new Response(content)
    const source = iterateBodyWithProgress(rsp.body as any, onUploadProgress)
    return {
      ...options,
      body: toStream.readable(source)
    }
  } else {
    return options
  }
}

const normalizeBody = (input: BodyInit | Readable): BodyInit => {
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input)
  } else if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  } else if (typeof input === 'string') {
    return Buffer.from(input)
  }
  // @ts-expect-error could be stream
  return input
}

/**
 * Takes body from native-fetch response as body and `onUploadProgress` handler
 * and returns async iterable that emits body chunks and emits
 * `onUploadProgress`.
 */
const iterateBodyWithProgress = async function * (body: Readable | null, onUploadProgress: UploadProgressFn): AsyncIterable<Buffer> {
  if (body == null) {
    onUploadProgress({ total: 0, loaded: 0, lengthComputable: true })
  } else if (Buffer.isBuffer(body)) {
    const total = body.byteLength
    const lengthComputable = true
    yield body
    onUploadProgress({ total, loaded: total, lengthComputable })
  } else {
    const total = 0
    const lengthComputable = false
    let loaded = 0
    for await (const chunk of body) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      loaded += chunk.byteLength
      yield chunk
      onUploadProgress({ total, loaded, lengthComputable })
    }
  }
}

export { fetchWithProgress as fetch }
export { Request }
export { Headers }
