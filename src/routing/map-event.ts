import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { multiaddr } from '@multiformats/multiaddr'
import { peerIdFromString } from '@libp2p/peer-id'
import { EventTypes, QueryEvent } from './index.js'
import type { PeerInfo } from '@libp2p/interface-peer-info'

export interface MapEventResponses {
  ID: string
  Addrs: string[]
}

export interface MapEvent {
  Type: EventTypes
  ID: ResponseType
  Extra: string
  Responses: MapEventResponses[]
}

export const mapEvent = (event: MapEvent): QueryEvent => {
  if (event.Type === EventTypes.SENDING_QUERY) {
    return {
      name: 'SENDING_QUERY',
      type: event.Type
    }
  }

  if (event.Type === EventTypes.PEER_RESPONSE) {
    return {
      from: peerIdFromString(event.ID),
      name: 'PEER_RESPONSE',
      type: event.Type,
      // TODO: how to infer this from the go-ipfs response
      messageType: 0,
      // TODO: how to infer this from the go-ipfs response
      messageName: 'PUT_VALUE',
      closer: (event.Responses ?? []).map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => multiaddr(addr)), protocols: [] })),
      providers: (event.Responses ?? []).map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => multiaddr(addr)), protocols: [] }))
      // TODO: how to infer this from the go-ipfs response
      // record: ???
    }
  }

  if (event.Type === EventTypes.FINAL_PEER) {
    // dht.query ends with a FinalPeer event with no Responses
    let peer: PeerInfo = {
      // @ts-expect-error go-ipfs does not return this
      id: event.ID ?? peerIdFromString(event.ID),
      multiaddrs: [],
      protocols: []
    }

    if (event.Responses?.length != null) {
      // dht.findPeer has the result in the Responses field
      peer = {
        id: peerIdFromString(event.Responses[0].ID),
        multiaddrs: event.Responses[0].Addrs.map(addr => multiaddr(addr)),
        protocols: []
      }
    }

    return {
      name: 'FINAL_PEER',
      type: event.Type,
      peer
    }
  }

  if (event.Type === EventTypes.QUERY_ERROR) {
    return {
      name: 'QUERY_ERROR',
      type: event.Type,
      error: new Error(event.Extra)
    }
  }

  if (event.Type === EventTypes.PROVIDER) {
    return {
      name: 'PROVIDER',
      type: event.Type,
      providers: event.Responses.map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => multiaddr(addr)), protocols: [] }))
    }
  }

  if (event.Type === EventTypes.VALUE) {
    return {
      name: 'VALUE',
      type: event.Type,
      value: uint8ArrayFromString(event.Extra, 'base64pad')
    }
  }

  if (event.Type === EventTypes.ADDING_PEER) {
    const peers = event.Responses.map(({ ID }) => peerIdFromString(ID))

    if (peers == null || peers.length == null || peers.length === 0) {
      throw new Error('No peer found')
    }

    return {
      name: 'ADDING_PEER',
      type: event.Type,
      peer: peers[0]
    }
  }

  if (event.Type === EventTypes.DIALING_PEER) {
    return {
      name: 'DIALING_PEER',
      type: event.Type,
      peer: peerIdFromString(event.ID)
    }
  }

  throw new Error('Unknown DHT event type')
}
