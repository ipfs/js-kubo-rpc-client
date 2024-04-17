import { anySignal } from 'any-signal'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ConfigAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createReplace (client: HTTPRPCClient): ConfigAPI['replace'] {
  return async function replace (config, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const res = await client.post('config/replace', {
        signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest([uint8ArrayFromString(JSON.stringify(config))], controller, options.headers)
        )
      })

      await res.text()
    } finally {
      signal.clear()
    }
  }
}
