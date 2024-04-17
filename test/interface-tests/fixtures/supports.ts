// in React Native: global === window === self
export const supportsFileReader = typeof self !== 'undefined' && 'FileReader' in self
export const supportsWebRTC = 'RTCPeerConnection' in globalThis && (typeof navigator !== 'undefined' && typeof navigator.mediaDevices !== 'undefined' && 'getUserMedia' in navigator.mediaDevices)
export const supportsWebRTCDataChannels = 'RTCPeerConnection' in globalThis
