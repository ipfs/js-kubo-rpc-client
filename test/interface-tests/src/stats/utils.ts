import { expect } from 'aegir/chai'
import type { BitswapStats } from '../../../../src/bitswap/index.js'
import type { RepoStatResult } from '../../../../src/repo/index.js'
import type { StatsBWResult } from '../../../../src/stats/index.js'

const isBigInt = (n: any): n is bigint => {
  return typeof n === 'bigint'
}

export function expectIsBitswap (err: Error | null, stats: BitswapStats): void {
  expect(err).to.not.exist()
  expect(stats).to.exist()
  expect(stats).to.have.a.property('provideBufLen')
  expect(stats).to.have.a.property('wantlist')
  expect(stats).to.have.a.property('peers')
  expect(stats).to.have.a.property('blocksReceived')
  expect(stats).to.have.a.property('dataReceived')
  expect(stats).to.have.a.property('blocksSent')
  expect(stats).to.have.a.property('dataSent')
  expect(stats).to.have.a.property('dupBlksReceived')
  expect(stats).to.have.a.property('dupDataReceived')

  expect(stats.provideBufLen).to.a('number')
  expect(stats.wantlist).to.be.an('array')
  expect(stats.peers).to.be.an('array')
  expect(isBigInt(stats.blocksReceived)).to.eql(true)
  expect(isBigInt(stats.dataReceived)).to.eql(true)
  expect(isBigInt(stats.blocksSent)).to.eql(true)
  expect(isBigInt(stats.dataSent)).to.eql(true)
  expect(isBigInt(stats.dupBlksReceived)).to.eql(true)
  expect(isBigInt(stats.dupDataReceived)).to.eql(true)
}

export function expectIsBandwidth (err: Error | null, stats: StatsBWResult): void {
  expect(err).to.not.exist()
  expect(stats).to.exist()
  expect(stats).to.have.a.property('totalIn')
  expect(stats).to.have.a.property('totalOut')
  expect(stats).to.have.a.property('rateIn')
  expect(stats).to.have.a.property('rateOut')
  expect(isBigInt(stats.totalIn)).to.eql(true)
  expect(isBigInt(stats.totalOut)).to.eql(true)
  expect(stats.rateIn).to.be.a('number')
  expect(stats.rateOut).to.be.a('number')
}

export function expectIsRepo (err: Error | null, res: RepoStatResult): void {
  expect(err).to.not.exist()
  expect(res).to.exist()
  expect(res).to.have.a.property('numObjects')
  expect(res).to.have.a.property('repoSize')
  expect(res).to.have.a.property('repoPath')
  expect(res).to.have.a.property('version')
  expect(res).to.have.a.property('storageMax')
  expect(isBigInt(res.numObjects)).to.eql(true)
  expect(isBigInt(res.repoSize)).to.eql(true)
  expect(isBigInt(res.storageMax)).to.eql(true)
  expect(res.repoPath).to.be.a('string')
  expect(res.version).to.be.a('string')
}
