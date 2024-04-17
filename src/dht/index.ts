import { createQuery } from './query.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { PeerId, PeerInfo } from '@libp2p/interface'
import type { CID } from 'multiformats/cid'

export interface DHTProvideOptions extends HTTPRPCOptions {
  recursive?: boolean
}

export enum DHTEventTypes {
  SENDING_QUERY = 0,
  PEER_RESPONSE,
  FINAL_PEER,
  QUERY_ERROR,
  PROVIDER,
  VALUE,
  ADDING_PEER,
  DIALING_PEER
}

/**
 * The types of messages set/received during DHT queries
 */
export enum DHTMessageType {
  PUT_VALUE = 0,
  GET_VALUE,
  ADD_PROVIDER,
  GET_PROVIDERS,
  FIND_NODE,
  PING
}

export type DHTMessageName = keyof typeof DHTMessageType

export interface DHTRecord {
  key: Uint8Array
  value: Uint8Array
  timeReceived?: Date
}

export interface DHTSendingQueryEvent {
  type: DHTEventTypes.SENDING_QUERY
  name: 'SENDING_QUERY'
}

export interface DHTPeerResponseEvent {
  from: PeerId
  type: DHTEventTypes.PEER_RESPONSE
  name: 'PEER_RESPONSE'
  messageType: DHTMessageType
  messageName: DHTMessageName
  providers: PeerInfo[]
  closer: PeerInfo[]
  record?: DHTRecord
}

export interface DHTFinalPeerEvent {
  peer: PeerInfo
  type: DHTEventTypes.FINAL_PEER
  name: 'FINAL_PEER'
}

export interface DHTQueryErrorEvent {
  type: DHTEventTypes.QUERY_ERROR
  name: 'QUERY_ERROR'
  error: Error
}

export interface DHTProviderEvent {
  type: DHTEventTypes.PROVIDER
  name: 'PROVIDER'
  providers: PeerInfo[]
}

export interface DHTValueEvent {
  type: DHTEventTypes.VALUE
  name: 'VALUE'
  value: Uint8Array
}

export interface DHTAddingPeerEvent {
  type: DHTEventTypes.ADDING_PEER
  name: 'ADDING_PEER'
  peer: PeerId
}

export interface DHTDialingPeerEvent {
  peer: PeerId
  type: DHTEventTypes.DIALING_PEER
  name: 'DIALING_PEER'
}

export type DHTQueryEvent = DHTSendingQueryEvent | DHTPeerResponseEvent | DHTFinalPeerEvent | DHTQueryErrorEvent | DHTProviderEvent | DHTValueEvent | DHTAddingPeerEvent | DHTDialingPeerEvent

export interface DHTAPI {
  /**
   * Find the closest peers to a given `PeerId` or `CID`, by querying the DHT.
   */
  query(peerId: PeerId | CID, options?: HTTPRPCOptions): AsyncIterable<DHTQueryEvent>
}

export function createDHT (client: HTTPRPCClient): DHTAPI {
  return {
    query: createQuery(client)
  }
}
