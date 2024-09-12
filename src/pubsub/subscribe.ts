import { publicKeyFromProtobuf } from '@libp2p/crypto/keys'
import { logger } from '@libp2p/logger'
import { peerIdFromString } from '@libp2p/peer-id'
import { textToUrlSafeRpc, rpcToText, rpcToBytes, rpcToBigInt } from '../lib/http-rpc-wire-format.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PubSubAPI, PubsubApiErrorHandlerFn } from './index.js'
import type { SubscriptionTracker } from './subscription-tracker.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { AbortError } from '../lib/errors.js'
import type { ExtendedResponse } from '../lib/http.js'
import type { Message } from '@libp2p/interface'

const log = logger('js-kubo-rpc-client:pubsub:subscribe')

export function createSubscribe (client: HTTPRPCClient, subsTracker: SubscriptionTracker): PubSubAPI['subscribe'] {
  return async function subscribe (topic, handler, options = {}) { // eslint-disable-line require-await
    options.signal = subsTracker.subscribe(topic, handler, options.signal)

    let done: (value?: any) => void
    let fail: (error: Error) => void

    const result = new Promise<void>((resolve, reject) => {
      done = resolve
      fail = reject
    })

    // In Firefox, the initial call to fetch does not resolve until some data
    // is received. If this doesn't happen within 1 second assume success
    const ffWorkaround = setTimeout(() => {
      done()
    }, 1000)

    // Do this async to not block Firefox
    void client.post('pubsub/sub', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: textToUrlSafeRpc(topic),
        ...options
      }),
      headers: options.headers
    })
      .catch((err) => {
        // Initial subscribe fail, ensure we clean up
        subsTracker.unsubscribe(topic, handler)

        fail(err)
      })
      .then((response) => {
        clearTimeout(ffWorkaround)

        if (response == null) {
          // if there was no response, the subscribe failed
          return
        }

        void readMessages(response, {
          onMessage: (message) => {
            if (handler == null) {
              return
            }

            if (typeof handler === 'function') {
              handler(message)
              return
            }

            if (typeof handler.handleEvent === 'function') {
              handler.handleEvent(message)
            }
          },
          onEnd: () => {
            subsTracker.unsubscribe(topic, handler)
          },
          onError: options.onError
        })

        done()
      })

    return result
  }
}

interface ReadMessagesOptions {
  onMessage(message: Message): void
  onEnd(): void
  onError?: PubsubApiErrorHandlerFn
}

async function readMessages (response: ExtendedResponse, { onMessage, onEnd, onError }: ReadMessagesOptions): Promise<void> {
  onError = onError ?? log

  try {
    for await (const msg of response.ndjson()) {
      try {
        if (msg.from == null) {
          // eslint-disable-next-line no-continue
          continue
        }

        if (msg.from != null && msg.seqno != null) {
          onMessage({
            type: 'signed',
            from: peerIdFromString(msg.from),
            data: rpcToBytes(msg.data),
            sequenceNumber: rpcToBigInt(msg.seqno),
            topic: rpcToText(msg.topicIDs[0]),
            // @ts-expect-error kubo does not supply the key
            key: msg.key != null ? publicKeyFromProtobuf(rpcToBytes(msg.key ?? 'u')) : undefined,
            signature: rpcToBytes(msg.signature ?? 'u')
          })
        } else {
          onMessage({
            type: 'unsigned',
            data: rpcToBytes(msg.data),
            topic: rpcToText(msg.topicIDs[0])
          })
        }
      } catch (err: any) {
        err.message = `Failed to parse pubsub message: ${err.message}`
        onError(err, false, msg) // Not fatal
      }
    }
  } catch (err: any) {
    if (!isAbortError(err)) {
      onError(err, true) // Fatal
    }
  } finally {
    onEnd()
  }
}

const isAbortError = (error: any): error is AbortError => {
  switch (error.type) {
    case 'aborted':
      return true
    // It is `abort` in Electron instead of `aborted`
    case 'abort':
      return true
    default:
      // FIXME: In testing with Chrome, err.type is undefined (should not be!)
      // Temporarily use the name property instead.
      return error.name === 'AbortError'
  }
}
