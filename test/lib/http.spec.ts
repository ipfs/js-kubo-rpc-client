import { Buffer } from 'buffer'
import { expect } from 'aegir/chai'
import delay from 'delay'
import all from 'it-all'
import drain from 'it-drain'
import toBuffer from 'it-to-buffer'
// @ts-expect-error no types
import toStream from 'it-to-stream'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { isBrowser, isWebWorker, isReactNative } from 'wherearewe'
import { HTTP } from '../../src/lib/http.js'

const ECHO_SERVER = process.env.ECHO_SERVER ?? ''

describe('http', function () {
  it('makes a GET request', async function () {
    const req = await HTTP.get(`${ECHO_SERVER}/echo/query?test=one`)
    const rsp = await req.json()
    expect(rsp).to.be.deep.eq({ test: 'one' })
  })

  it('makes a GET request with redirect', async function () {
    const req = await HTTP.get(`${ECHO_SERVER}/redirect?to=${encodeURI(`${ECHO_SERVER}/echo/query?test=one`)}`)
    const rsp = await req.json()
    expect(rsp).to.be.deep.eq({ test: 'one' })
  })

  it.skip('makes a GET request with a really short timeout', function () {
    return expect(HTTP.get(`${ECHO_SERVER}/redirect?to=${encodeURI(`${ECHO_SERVER}/echo/query?test=one`)}`, {
      timeout: 1
    })).to.eventually.be.rejectedWith().instanceOf(HTTP.TimeoutError)
  })

  it('respects headers', async function () {
    const req = await HTTP.post(`${ECHO_SERVER}/echo/headers`, {
      headers: {
        foo: 'bar'
      }
    })
    const rsp = await req.json()
    expect(rsp).to.have.property('foo', 'bar')
  })

  it('respects constructor headers', async function () {
    const http = new HTTP({
      headers: {
        bar: 'baz'
      }
    })
    const req = await http.post(`${ECHO_SERVER}/echo/headers`)
    const rsp = await req.json()
    expect(rsp).to.have.property('bar', 'baz')
  })

  it('makes a JSON request', async () => {
    const req = await HTTP.post(`${ECHO_SERVER}/echo`, {
      json: {
        test: 2
      }
    })

    const out = await req.text()
    expect(out).to.be.eq('{"test":2}')
  })

  it('makes a ReadableStream request', async () => {
    if (globalThis.ReadableStream == null) {
      return
    }

    const data = 'hello world'

    const body = new globalThis.ReadableStream({
      start (controller) {
        controller.enqueue(data)
        controller.close()
      }
    })

    const req = await HTTP.post(`${ECHO_SERVER}/echo`, {
      body
    })

    const out = uint8ArrayToString(await toBuffer(req.iterator()))
    expect(out).to.equal('hello world')
  })

  it('makes a DELETE request', async () => {
    const req = await HTTP.delete(`${ECHO_SERVER}/echo`, {
      json: {
        test: 2
      }
    })

    const out = await req.text()
    expect(out).to.be.eq('{"test":2}')
  })

  it('allow async aborting', async function () {
    const controller = new AbortController()
    const res = HTTP.get(ECHO_SERVER, {
      signal: controller.signal
    })
    controller.abort()

    await expect(res).to.eventually.be.rejectedWith(/aborted/i)
  })

  it('parses the response as ndjson', async function () {
    const res = await HTTP.post(`${ECHO_SERVER}/echo`, {
      body: '{}\n{}'
    })

    const entities = await all(res.ndjson())

    expect(entities).to.deep.equal([{}, {}])
  })

  it('parses the response as an async iterable', async function () {
    const res = await HTTP.post('echo', {
      base: ECHO_SERVER,
      body: 'hello world'
    })

    const entities = await all(res.iterator())

    expect(entities).to.deep.equal([Buffer.from('hello world')])
  })

  it.skip('should handle errors in streaming bodies', async function () {
    if (isBrowser || isWebWorker || isReactNative) {
      // streaming bodies not supported by browsers nor by React Native
      return this.skip()
    }

    const err = new Error('Should be caught')
    const body = (async function * () {
      yield Buffer.from('{}\n')

      await delay(100)

      throw err
    }())

    const res = await HTTP.post(ECHO_SERVER, {
      body: toStream.readable(body)
    })

    await expect(drain(res.ndjson())).to.eventually.be.rejectedWith(/aborted/)
  })

  it.skip('should handle errors in streaming bodies when a signal is passed', async function () {
    if (isBrowser || isWebWorker || isReactNative) {
      // streaming bodies not supported by browsers nor by React Native
      return this.skip()
    }

    const controller = new AbortController()
    const err = new Error('Should be caught')
    const body = (async function * () {
      yield Buffer.from('{}\n')

      await delay(100)

      throw err
    }())
    const res = await HTTP.post(ECHO_SERVER, {
      body: toStream.readable(body),
      signal: controller.signal
    })

    await expect(drain(res.ndjson())).to.eventually.be.rejectedWith(/aborted/)
  })

  it('progress events', async function () {
    this.timeout(10000)
    let upload = 0
    const body = new Uint8Array(1000000 / 2)
    let progressInfo
    const request = await HTTP.post(`${ECHO_SERVER}/echo`, {
      body,
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      onUploadProgress: (progress) => {
        progressInfo = progress
        upload += 1
      }
    })

    const out = uint8ArrayConcat(await all(request.iterator()))
    expect(uint8ArrayEquals(out, body))

    expect(upload).to.be.greaterThan(0)
    expect(progressInfo).to.have.property('lengthComputable').to.be.a('boolean')
    expect(progressInfo).to.have.property('total').to.be.a('number')
    expect(progressInfo).to.have.property('loaded').that.is.greaterThan(0)
  })

  it('makes a GET request with unprintable characters', async function () {
    const buf = uint8ArrayFromString('a163666f6f6c6461672d63626f722d626172', 'base16')
    const params = Array.from(buf).map(val => `data=${val.toString()}`).join('&')

    const req = await HTTP.get(`${ECHO_SERVER}/download?${params}`)
    const rsp = await req.arrayBuffer()
    expect(uint8ArrayEquals(new Uint8Array(rsp), buf)).to.be.true()
  })
})
