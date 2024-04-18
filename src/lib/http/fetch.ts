/*
let implName = './fetch.node.js'

if (typeof XMLHttpRequest === 'function') {
  // Electron has `XMLHttpRequest` and should get the browser implementation
  // instead of node.
  implName = './fetch.browser.js'
}

const fetch = await import(implName)

export default fetch

const Headers = fetch.Headers
const Request = fetch.Request
const Response = fetch.Response

export { fetch }
export { Headers }
export { Request }
export { Response }
*/
export * from './fetch.node.js'
