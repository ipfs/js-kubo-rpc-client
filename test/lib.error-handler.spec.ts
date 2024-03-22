/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { throwsAsync } from './utils/throws-async.js'
import { errorHandler, HTTPError } from '../src/lib/core.js'

describe('lib/error-handler', function () {
  it('should parse json error response', async function () {
    const res = {
      ok: false,
      statusText: 'test',
      headers: { get: () => 'application/json' },
      json: async () => await Promise.resolve({
        Message: 'boom',
        Code: 0,
        Type: 'error'
      }),
      status: 500
    }

    // @ts-expect-error
    const err = await throwsAsync(errorHandler(res))

    expect(err instanceof HTTPError).to.be.true()
    expect(err.message).to.eql('boom')
    expect(err.response.status).to.eql(500)
  })

  it('should gracefully fail on parse json', async function () {
    const res = {
      ok: false,
      headers: { get: () => 'application/json' },
      json: () => 'boom', // not valid json!
      status: 500
    }

    // @ts-expect-error
    const err = await throwsAsync(errorHandler(res))
    expect(err instanceof HTTPError).to.be.true()
  })

  it('should gracefully fail on read text', async function () {
    const res = {
      ok: false,
      headers: { get: () => 'text/plain' },
      text: async () => await Promise.reject(new Error('boom')),
      status: 500
    }

    // @ts-expect-error
    const err = await throwsAsync(errorHandler(res))
    expect(err instanceof HTTPError).to.be.true()
  })
})
