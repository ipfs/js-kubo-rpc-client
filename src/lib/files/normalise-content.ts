import { InvalidParametersError } from '@libp2p/interface'
import blobToIt from 'blob-to-it'
import browserStreamToIt from 'browser-readablestream-to-it'
import all from 'it-all'
import map from 'it-map'
import itPeekable from 'it-peekable'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import {
  isBytes,
  isReadableStream,
  isBlob
} from './utils.js'
import type { ToContent } from '../../index.js'

async function * toAsyncIterable <T> (thing: T): AsyncIterable<T> {
  yield thing
}

export async function normaliseContent (input: ToContent): Promise<AsyncIterable<Uint8Array>> {
  // Bytes | String
  if (isBytes(input)) {
    return toAsyncIterable(toBytes(input))
  }

  if (typeof input === 'string' || input instanceof String) {
    return toAsyncIterable(toBytes(input.toString()))
  }

  // Blob
  if (isBlob(input)) {
    return blobToIt(input)
  }

  // Browser stream
  if (isReadableStream(input)) {
    input = browserStreamToIt(input)
  }

  // (Async)Iterator<?>
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    // @ts-expect-error cannot detect iterability
    const peekable = itPeekable(input)
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const { value, done } = await peekable.peek()

    if (done === true) {
      // make sure empty iterators result in empty files
      return toAsyncIterable(new Uint8Array(0))
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    if (Number.isInteger(value)) {
      // @ts-expect-error cannot detect peekable generic type
      // eslint-disable-next-line @typescript-eslint/await-thenable
      return toAsyncIterable(Uint8Array.from(await all(peekable)))
    }

    // (Async)Iterable<Bytes|String>
    // @ts-expect-error value is never when instanceof String tested
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      // @ts-expect-error cannot derive type
      return map(peekable, toBytes)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  throw new InvalidParametersError(`Unexpected input: ${input}`)
}

function toBytes (chunk: ArrayBuffer | ArrayBufferView | string | InstanceType<typeof window.String> | number[]): Uint8Array {
  if (chunk instanceof Uint8Array) {
    return chunk
  }

  if (ArrayBuffer.isView(chunk)) {
    return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
  }

  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk)
  }

  if (Array.isArray(chunk)) {
    return Uint8Array.from(chunk)
  }

  return uint8ArrayFromString(chunk.toString())
}
