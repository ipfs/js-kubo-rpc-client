import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @param {object} json
 * @param {string} json.Name
 * @param {string} json.Cid
 * @param {import('../../types.js').Status} json.Status
 * @returns {import('../../types.js').Pin}
 */
export const decodePin = ({ Name: name, Status: status, Cid: cid }) => {
  return {
    cid: CID.parse(cid),
    name,
    status
  }
}

/**
 * @param {any} service
 * @returns {string}
 */
export const encodeService = (service) => {
  if (typeof service === 'string' && service !== '') {
    return service
  } else {
    throw new TypeError('service name must be passed')
  }
}

/**
 * @param {any} cid
 * @returns {string}
 */
export const encodeCID = (cid) => {
  if (CID.asCID(cid)) {
    return cid.toString()
  } else {
    throw new TypeError(`CID instance expected instead of ${typeof cid}`)
  }
}

/**
 * @param {import('../../types.js').Query & { all?: boolean }} query
 * @returns {URLSearchParams}
 */
export const encodeQuery = ({ service, cid, name, status, all }) => {
  const query = toUrlSearchParams({
    service: encodeService(service),
    name,
    force: all ? true : undefined
  })

  if (cid) {
    for (const value of cid) {
      query.append('cid', encodeCID(value))
    }
  }

  if (status) {
    for (const value of status) {
      query.append('status', value)
    }
  }

  return query
}

/**
 * @param {import('../../types.js').AddOptions & {cid:CID}} options
 * @returns {URLSearchParams}
 */
export const encodeAddParams = ({ cid, service, background, name, origins }) => {
  const params = toUrlSearchParams({
    arg: encodeCID(cid),
    service: encodeService(service),
    name,
    background: background ? true : undefined
  })

  if (origins) {
    for (const origin of origins) {
      params.append('origin', origin.toString())
    }
  }

  return params
}
