import { InvalidParametersError } from '@libp2p/interface'
import browserStreamToIt from 'browser-readablestream-to-it'
import all from 'it-all'
import itPeekable from 'it-peekable'
import {
  isBytes,
  isBlob,
  isReadableStream
} from './utils.js'
import type { ToContent } from '../../index.js'

export async function normaliseContent (input: ToContent): Promise<Blob> {
  // Bytes
  if (isBytes(input)) {
    return new Blob([input])
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    return new Blob([input.toString()])
  }

  // Blob | File
  if (isBlob(input)) {
    return input
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
      return itToBlob(peekable)
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    if (Number.isInteger(value)) {
      // @ts-expect-error cannot detect peekable generic type
      // eslint-disable-next-line @typescript-eslint/await-thenable
      return new Blob([Uint8Array.from(await all(peekable))])
    }

    // (Async)Iterable<Bytes|String>
    // @ts-expect-error value is never when instanceof String tested
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      return itToBlob(peekable)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  throw new InvalidParametersError(`Unexpected input: ${input}`)
}

async function itToBlob (stream: AsyncIterable<BlobPart> | Iterable<BlobPart>): Promise<Blob> {
  const parts = []

  for await (const chunk of stream) {
    parts.push(chunk)
  }

  return new Blob(parts)
}
