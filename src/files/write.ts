import { modeToString } from '../lib/mode-to-string.js'
import { parseMtime } from '../lib/parse-mtime.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import type { Client } from '../lib/core.js'
import type { WriteOptions } from './index.js'

export function createWrite (client: Client) {
  async function write (path: string, input: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>, options?: WriteOptions): Promise<void> {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    const res = await client.post('files/write', {
      signal,
      searchParams: toUrlSearchParams({
        arg: path,
        streamChannels: true,
        count: options?.length,
        ...options
      }),
      ...(
        await multipartRequest([{
          content: input,
          path: 'arg',
          mode: modeToString(options?.mode),
          mtime: parseMtime(options?.mtime)
        }], controller, options?.headers)
      )
    })

    await res.text()
  }

  return write
}
