import { logger } from '@libp2p/logger'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { textToUrlSafeRpc, rpcToText, rpcToBytes, rpcToBigInt } from '../lib/http-rpc-wire-format.js'
import { peerIdFromString } from '@libp2p/peer-id'
import type { ExtendedResponse, Message, PubsubApiErrorHandlerFn } from '../index.js'
import type { SubscriptionTracker } from './subscription-tracker.js'
import type { EventHandler } from '@libp2p/interfaces/events'
import type { Client } from '../lib/core.js'
import type { SubscribeOptions } from './index.js'
const log = logger('js-kubo-rpc-client:pubsub:subscribe')

export function createSubscribe (client: Client, subsTracker: SubscriptionTracker) {
  async function subscribe (topic: string, handler: EventHandler<Message>, options: SubscribeOptions = {}): Promise<void> { // eslint-disable-line require-await
    options.signal = subsTracker.subscribe(topic, handler, options.signal)

    let done: (value?: any) => void
    let fail: (error: Error) => void

    const result = new Promise((resolve, reject) => {
      done = resolve
      fail = reject
    })

    // In Firefox, the initial call to fetch does not resolve until some data
    // is received. If this doesn't happen within 1 second assume success
    const ffWorkaround = setTimeout(() => done(), 1000)

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
          onMessage: (message: any) => {
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
          onEnd: () => subsTracker.unsubscribe(topic, handler),
          onError: options.onError ?? (() => {})
        })

        done()
      })

    await result
  }
  return subscribe
}

interface ReadMessagesOptions {
  onMessage: (message: Message) => void
  onEnd: () => void
  onError: PubsubApiErrorHandlerFn
}

async function readMessages (response: ExtendedResponse, { onMessage, onEnd, onError }: ReadMessagesOptions) {
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
            key: rpcToBytes(msg.key ?? 'u'),
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
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

const isAbortError = (error: Error & {type?: string}): boolean => {
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