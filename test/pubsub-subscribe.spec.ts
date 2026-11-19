import { expect } from 'aegir/chai'
import defer from 'p-defer'
import sinon from 'sinon'
import { Client } from '../src/lib/core.ts'
import { createSubscribe } from '../src/pubsub/subscribe.ts'
import { SubscriptionTracker } from '../src/pubsub/subscription-tracker.ts'
import type { ExtendedResponse } from '../src/lib/http.ts'
import type { SinonFakeTimers } from 'sinon'

describe('pubsub subscribe lifecycle', () => {
  let clock: SinonFakeTimers
  let client: Client
  let tracker: SubscriptionTracker

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    client = new Client({ url: 'http://localhost:5001' })
    tracker = new SubscriptionTracker()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('rejects an initial failure before the Firefox timer without a duplicate callback', async () => {
    const error = new Error('pubsub disabled')
    sinon.stub(client, 'post').rejects(error)
    const onError = sinon.spy()
    const unsubscribe = sinon.spy(tracker, 'unsubscribe')

    await expect(createSubscribe(client, tracker)('topic', () => {}, { onError })).to.be.rejectedWith(error)

    sinon.assert.notCalled(onError)
    sinon.assert.calledOnce(unsubscribe)
    expect(clock.countTimers()).to.equal(0)
  })

  it('notifies onError when the initial request fails after the Firefox timer', async () => {
    const request = defer<ExtendedResponse>()
    sinon.stub(client, 'post').returns(request.promise)
    const onError = sinon.spy()
    const unsubscribe = sinon.spy(tracker, 'unsubscribe')
    const subscription = createSubscribe(client, tracker)('topic', () => {}, { onError })

    await clock.tickAsync(1000)
    await subscription
    const error = new Error('pubsub disabled')
    request.reject(error)
    await clock.tickAsync(0)

    sinon.assert.calledOnceWithExactly(onError, error, true)
    sinon.assert.calledOnce(unsubscribe)
    expect(clock.countTimers()).to.equal(0)
  })

  it('does not notify onError when an established subscription is explicitly cancelled', async () => {
    const request = defer<ExtendedResponse>()
    sinon.stub(client, 'post').returns(request.promise)
    const onError = sinon.spy()
    const handler = (): void => {}
    const subscription = createSubscribe(client, tracker)('topic', handler, { onError })

    await clock.tickAsync(1000)
    await subscription
    tracker.unsubscribe('topic', handler)
    request.reject(Object.assign(new Error('cancelled'), { name: 'AbortError' }))
    await clock.tickAsync(0)

    sinon.assert.notCalled(onError)
  })

  it('notifies onError once when an established stream ends normally', async () => {
    const end = defer<void>()
    const response = Object.assign(new Response(), {
      async * iterator (): AsyncGenerator<Uint8Array> {},
      async * ndjson (): AsyncGenerator<unknown> {
        await end.promise
        yield * []
      }
    })
    sinon.stub(client, 'post').resolves(response)
    const onError = sinon.spy()
    const unsubscribe = sinon.spy(tracker, 'unsubscribe')

    await createSubscribe(client, tracker)('topic', () => {}, { onError })
    end.resolve()
    await clock.tickAsync(0)

    sinon.assert.calledOnce(onError)
    expect(onError.firstCall.args[0]).to.be.instanceOf(Error)
    expect(onError.firstCall.args[1]).to.equal(true)
    sinon.assert.calledOnce(unsubscribe)
  })

  it('notifies onError once when reading the stream fails', async () => {
    const end = defer<void>()
    const error = new Error('stream failed')
    const response = Object.assign(new Response(), {
      async * iterator (): AsyncGenerator<Uint8Array> {},
      async * ndjson (): AsyncGenerator<unknown> {
        await end.promise
        yield * []
        throw error
      }
    })
    sinon.stub(client, 'post').resolves(response)
    const onError = sinon.spy()

    await createSubscribe(client, tracker)('topic', () => {}, { onError })
    end.resolve()
    await clock.tickAsync(0)

    sinon.assert.calledOnceWithExactly(onError, error, true)
  })

  it('does not report a normal stream end caused by unsubscribe', async () => {
    const end = defer<void>()
    const response = Object.assign(new Response(), {
      async * iterator (): AsyncGenerator<Uint8Array> {},
      async * ndjson (): AsyncGenerator<unknown> {
        await end.promise
        yield * []
      }
    })
    sinon.stub(client, 'post').resolves(response)
    const onError = sinon.spy()
    const handler = (): void => {}

    await createSubscribe(client, tracker)('topic', handler, { onError })
    tracker.unsubscribe('topic', handler)
    end.resolve()
    await clock.tickAsync(0)

    sinon.assert.notCalled(onError)
  })
})
