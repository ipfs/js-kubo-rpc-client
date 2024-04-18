import { expect } from 'aegir/chai'
import type { PingResult } from '../../../../src'

export function expectIsPingResponse (obj: any): void {
  expect(obj).to.have.a.property('success')
  expect(obj).to.have.a.property('time')
  expect(obj).to.have.a.property('text')
  expect(obj.success).to.be.a('boolean')
  expect(obj.time).to.be.a('number')
  expect(obj.text).to.be.a('string')
}

/**
 * Determine if a ping response object is a pong, or something else, like a
 * status message
 */
export function isPong (pingResponse: any): pingResponse is PingResult {
  return Boolean(pingResponse?.success != null && (pingResponse.text == null || pingResponse.text === ''))
}
