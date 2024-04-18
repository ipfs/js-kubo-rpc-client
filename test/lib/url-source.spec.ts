import { Buffer } from 'buffer'
import { expect } from 'aegir/chai'
import all from 'it-all'
import { urlSource } from '../../src/index.js'

describe('url-source', function () {
  it('can get url content', async function () {
    const content = 'foo'
    const file = urlSource(`${process.env.ECHO_SERVER}/download?data=${content}`)

    expect(file).to.have.property('path', 'download')

    if (file?.content != null) {
      await expect(all(file.content)).to.eventually.deep.equal([Buffer.from(content)])
    } else {
      throw new Error('empty response')
    }
  })
})
