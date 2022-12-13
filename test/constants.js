const isWindows = globalThis.process && globalThis.process.platform && globalThis.process.platform === 'win32'
const isFirefox = globalThis.navigator?.userAgent?.toLowerCase().includes('firefox')

export {
  isWindows,
  isFirefox
}
