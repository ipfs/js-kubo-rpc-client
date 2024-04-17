import browserStreamToIt from 'browser-readablestream-to-it'
import errCode from 'err-code'
import itPeekable from 'it-peekable'
import {
  isBytes,
  isBlob,
  isReadableStream,
  isFileObject,
  parseMtime,
  parseMode
} from './utils.js'
import type { ImportCandidate, ToContent } from '../../index.js'

// eslint-disable-next-line complexity
export async function * normaliseCandidateSingle (input: ImportCandidate, normaliseContent: (content: ToContent) => Promise<AsyncIterable<Uint8Array>>): AsyncGenerator<ImportCandidate, void, undefined> {
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    yield toFileObject(input.toString(), normaliseContent)
    return
  }

  // Uint8Array|ArrayBuffer|TypedArray
  // Blob|File
  if (isBytes(input) || isBlob(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  // Browser ReadableStream
  if (isReadableStream(input)) {
    input = browserStreamToIt(input)
  }

  // Iterable<?>
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    // @ts-expect-error cannot detect iterability
    const peekable = itPeekable(input)
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const { value, done } = await peekable.peek()

    if (done === true) {
      // make sure empty iterators result in empty files
      yield { content: [] }
      return
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    // (Async)Iterable<Bytes>
    // (Async)Iterable<String>
    // @ts-expect-error value is never when instanceof String tested
    if (Number.isInteger(value) || isBytes(value) || typeof value === 'string' || value instanceof String) {
      yield toFileObject(peekable, normaliseContent)
      return
    }

    throw errCode(new Error('Unexpected input: multiple items passed - if you are using ipfs.add, please use ipfs.addAll instead'), 'ERR_UNEXPECTED_INPUT')
  }

  // { path, content: ? }
  // Note: Detected _after_ (Async)Iterable<?> because Node.js fs.ReadStreams have a
  // `path` property that passes this check.
  if (isFileObject(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  throw errCode(new Error('Unexpected input: cannot convert "' + typeof input + '" into ImportCandidate'), 'ERR_UNEXPECTED_INPUT')
}

async function toFileObject (input: ImportCandidate, normaliseContent: (content: ToContent) => Promise<AsyncIterable<Uint8Array>>): Promise<ImportCandidate> {
  // @ts-expect-error - Those properties don't exist on most input types
  const { path, mode, mtime, content } = input

  const file: ImportCandidate = {
    path: path ?? '',
    mode: parseMode(mode),
    mtime: parseMtime(mtime)
  }

  if (content != null) {
    // @ts-expect-error - input still can be different ToContent
    file.content = await normaliseContent(content)
  } else if (path == null) { // Not already a file object with path or content prop
    // @ts-expect-error - input still can be different ToContent
    file.content = await normaliseContent(input)
  }

  return file
}
