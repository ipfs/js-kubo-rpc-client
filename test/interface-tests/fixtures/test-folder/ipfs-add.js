#!/usr/bin/env node
// @ts-nocheck

const ipfs = require('../src')('localhost', 5001)
const files = process.argv.slice(2)
/* eslint-disable no-console */

ipfs.add(files, { recursive: true }, function (err, res) {
  if (err || !res) { return console.log(err) }

  for (let i = 0; i < res.length; i++) {
    console.log('added', res[i].Hash, res[i].Name)
  }
})
