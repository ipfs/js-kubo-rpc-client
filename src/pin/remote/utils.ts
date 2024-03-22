import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { AddOptions, Pin, Query, Status } from './index.js'

export const decodePin = ({ Name: name, Status: status, Cid: cid }: {Name: string, Status: Status, Cid: string}): Pin => {
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

export const encodeQuery = ({ service, cid, name, status, all }: Query & { all?: boolean }): URLSearchParams => {
  const query = toUrlSearchParams({
    service: encodeService(service),
    name,
    force: all != null ? true : undefined
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

export const encodeAddParams = ({ cid, service, background, name, origins }: AddOptions & { cid: CID }): URLSearchParams => {
  const params = toUrlSearchParams({
    arg: encodeCID(cid),
    service: encodeService(service),
    name,
    background
  })

  if (origins != null) {
    for (const origin of origins) {
      params.append('origin', origin.toString())
    }
  }

  return params
}
