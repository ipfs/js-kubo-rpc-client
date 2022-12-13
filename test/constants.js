const isWindows = globalThis.process && globalThis.process.platform && globalThis.process.platform === 'win32'
const isFirefox = globalThis.navigator?.userAgent?.toLowerCase().includes('firefox')
const isChrome = globalThis.navigator?.userAgent?.toLowerCase().includes('chrome')

export {
  isWindows,
  isFirefox,
  isChrome
}
