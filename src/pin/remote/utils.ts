import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { PinRemoteAddOptions, RemotePin, RemotePinQuery } from './index.js'

export const decodePin = ({ Name: name, Status: status, Cid: cid }: any): RemotePin => {
  return {
    cid: CID.parse(cid),
    name,
    status
  }
}

export const encodeService = (service: any): string => {
  if (typeof service === 'string' && service !== '') {
    return service
  } else {
    throw new TypeError('service name must be passed')
  }
}

export const encodeCID = (cid: any): string => {
  if (CID.asCID(cid) != null) {
    return cid.toString()
  } else {
    throw new TypeError(`CID instance expected instead of ${typeof cid}`)
  }
}

export const encodeQuery = ({ service, cid, name, status, all }: RemotePinQuery): URLSearchParams => {
  const query = toUrlSearchParams({
    service: encodeService(service),
    name,
    force: all === true ? true : undefined
  })

  if (cid != null) {
    for (const value of cid) {
      query.append('cid', encodeCID(value))
    }
  }

  if (status != null) {
    for (const value of status) {
      query.append('status', value)
    }
  }

  return query
}

export const encodeAddParams = (cid: CID, { service, background, name, origins }: PinRemoteAddOptions): URLSearchParams => {
  const params = toUrlSearchParams({
    arg: encodeCID(cid),
    service: encodeService(service),
    name,
    background: background === true ? true : undefined
  })

  if (origins != null) {
    for (const origin of origins) {
      params.append('origin', origin.toString())
    }
  }

  return params
}
