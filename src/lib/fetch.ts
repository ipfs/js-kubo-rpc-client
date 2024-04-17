/*
import { isElectronMain } from 'wherearewe'

// use window.fetch if it is available, fall back to node-fetch if not
let impl = 'native-fetch'

if (isElectronMain) {
  impl = 'electron-fetch'
}

const fetch = await import(impl)

export default fetch

const Headers = fetch.Headers
const Request = fetch.Request
const Response = fetch.Response

export { Headers }
export { Request }
export { Response }

*/
export * from 'native-fetch'
