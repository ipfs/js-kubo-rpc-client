import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import type { ClientOptions } from '../index.js'
import type { Config } from './index.js'
import type { Client } from '../lib/core.js'

export function createReplace (client: Client) {
  const replace = async (config: Config, options?: ClientOptions): Promise<void> => {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    const res = await client.post('config/replace', {
      signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest([uint8ArrayFromString(JSON.stringify(config))], controller, options?.headers)
      )
    })

    await res.text()
  }

  return replace
}
