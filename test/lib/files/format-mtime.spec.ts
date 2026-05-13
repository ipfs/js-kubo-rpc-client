import { expect } from 'aegir/chai'
import { formatMtime } from '../../../src/lib/files/format-mtime.ts'

describe('format-mtime', function () {
  it('formats mtime', function () {
    expect(formatMtime({ secs: 15768000n, nsecs: 0 })).to.include('1970')
  })

  it('formats empty mtime', function () {
    expect(formatMtime()).to.equal('-')
  })
})
