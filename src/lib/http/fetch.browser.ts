import { fetch, Response, Request, Headers } from '../fetch.js'
import { TimeoutError, AbortError } from './error.js'
import type { FetchOptions } from '../http.js'

/**
 * Fetch with progress
 *
 * @param {string | Request} url
 * @param {FetchOptions} [options]
 * @returns {Promise<ResponseWithURL>}
 */
const fetchWithProgress = async (url: string | Request, options: FetchOptions = {}): Promise<ResponseWithURL> => {
  const request = new XMLHttpRequest()
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  request.open(options.method ?? 'GET', url.toString(), true)

  const { timeout, headers } = options
  const t = Number(timeout)

  if (!isNaN(t) && t > 0 && t < Infinity) {
    request.timeout = t
  }

  if (options.overrideMimeType != null) {
    request.overrideMimeType(options.overrideMimeType)
  }

  if (headers != null) {
    for (const [name, value] of new Headers(headers)) {
      request.setRequestHeader(name, value)
    }
  }

  if (options.signal != null) {
    options.signal.onabort = () => {
      request.abort()
    }
  }

  if (options.onUploadProgress != null) {
    request.upload.onprogress = options.onUploadProgress
  }

  // Note: Need to use `arraybuffer` here instead of `blob` because `Blob`
  // instances coming from JSDOM are not compatible with `Response` from
  // node-fetch (which is the setup we get when testing with jest because
  // it uses JSDOM which does not provide a global fetch
  // https://github.com/jsdom/jsdom/issues/1724)
  request.responseType = 'arraybuffer'

  return new Promise((resolve, reject) => {
    const handleEvent = (event: Event): void => {
      switch (event.type) {
        case 'error': {
          resolve(Response.error())
          break
        }
        case 'load': {
          resolve(
            new ResponseWithURL(request.responseURL, request.response, {
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders())
            })
          )
          break
        }
        case 'timeout': {
          reject(new TimeoutError())
          break
        }
        case 'abort': {
          reject(new AbortError())
          break
        }
        default: {
          break
        }
      }
    }
    request.onerror = handleEvent
    request.onload = handleEvent
    request.ontimeout = handleEvent
    request.onabort = handleEvent

    // @ts-expect-error options.body can be a node readable stream, which isn't compatible with XHR, but this
    // file is a browser override so you won't get a node readable stream so ignore the error
    request.send(options.body)
  })
}

const fetchWithStreaming = fetch

const fetchWith = (url: string | Request, options: FetchOptions = {}): any =>
  (options.onUploadProgress != null)
    ? fetchWithProgress(url, options)
    : fetchWithStreaming(url, options)

/**
 * Parse Headers from a XMLHttpRequest
 */
const parseHeaders = (input: string): Headers => {
  const headers = new Headers()
  for (const line of input.trim().split(/[\r\n]+/)) {
    const index = line.indexOf(': ')
    if (index > 0) {
      headers.set(line.slice(0, index), line.slice(index + 1))
    }
  }

  return headers
}

class ResponseWithURL extends Response {
  constructor (url: string, body: BodyInit, options: ResponseInit) {
    super(body, options)
    Object.defineProperty(this, 'url', { value: url })
  }
}

export { fetchWith as fetch }
export { Headers }
export { Request }
