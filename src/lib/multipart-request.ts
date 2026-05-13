import { nanoid } from 'nanoid'
import { isElectronRenderer } from 'wherearewe'
import { multipartRequest as multipartRequestBrowser } from './multipart-request.browser.ts'
import { multipartRequest as multipartRequestNode } from './multipart-request.node.ts'
import type { ImportCandidateStream } from '../index.ts'

export interface MultipartRequest {
  total: number
  parts: Array<{ name?: string, start: number, end: number }>
  headers: Headers | Record<string, string>
  body: BodyInit
}

export async function multipartRequest (source: ImportCandidateStream, abortController: AbortController, headers: Headers | Record<string, string> = {}, boundary: string = `-----------------------------${nanoid()}`): Promise<MultipartRequest> {
  let req = multipartRequestNode

  // In electron-renderer we use native fetch and should encode body using native
  // form data.
  if (isElectronRenderer) {
    req = multipartRequestBrowser
  }

  return req(source, abortController, headers, boundary)
}
