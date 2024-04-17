import { anySignal } from 'any-signal'
import { parseMtime } from '../lib/files/utils.js'
import { modeToString } from '../lib/mode-to-string.js'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { FilesAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createWrite (client: HTTPRPCClient): FilesAPI['write'] {
  return async function write (path, input, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const res = await client.post('files/write', {
        signal,
        searchParams: toUrlSearchParams({
          arg: path,
          streamChannels: true,
          count: options.length,
          ...options
        }),
        ...(
          await multipartRequest([{
            content: input,
            path: 'arg',
            mode: modeToString(options.mode),
            mtime: parseMtime(options.mtime)
          }], controller, options.headers)
        )
      })

      await res.text()
    } finally {
      signal.clear()
    }
  }
}
