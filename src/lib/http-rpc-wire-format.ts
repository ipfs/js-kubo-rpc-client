import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { base64url } from 'multiformats/bases/base64'

/* HTTP RPC:
 * - wraps binary data in multibase. base64url is used to avoid issues
 *   when a binary data is passed as search param in URL.
 *   Historical context: https://github.com/ipfs/go-ipfs/issues/7939
 *   Multibase wrapping introduced in: https://github.com/ipfs/go-ipfs/pull/8183
 */

const rpcArrayToTextArray = (strings: string[]): string[] => {
  if (Array.isArray(strings)) {
    return strings.map(rpcToText)
  }
  return strings
}

const rpcToText = (mb: string): string => uint8ArrayToString(rpcToBytes(mb))

const rpcToBytes = (mb: string): Uint8Array => base64url.decode(mb)

const rpcToBigInt = (mb: string): bigint => BigInt(`0x${uint8ArrayToString(base64url.decode(mb), 'base16')}`)

const textToUrlSafeRpc = (text: string): string => base64url.encode(uint8ArrayFromString(text))

export { rpcArrayToTextArray, rpcToText, rpcToBytes, rpcToBigInt, textToUrlSafeRpc }
