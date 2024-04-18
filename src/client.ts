import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as dagPB from '@ipld/dag-pb'
import * as dagJOSE from 'dag-jose'
import { bases, hashes, codecs } from 'multiformats/basics'
import { identity } from 'multiformats/hashes/identity'
import { createAddAll } from './add-all.js'
import { createAdd } from './add.js'
import { createBitswap } from './bitswap/index.js'
import { createBlock } from './block/index.js'
import { createBootstrap } from './bootstrap/index.js'
import { createCat } from './cat.js'
import { createCommands } from './commands.js'
import { createConfig } from './config/index.js'
import { createDAG } from './dag/index.js'
import { createDHT } from './dht/index.js'
import { createDiag } from './diag/index.js'
import { createFiles } from './files/index.js'
import { createGetEndpointConfig } from './get-endpoint-config.js'
import { createGet } from './get.js'
import { createId } from './id.js'
import { createIsOnline } from './is-online.js'
import { createKey } from './key/index.js'
import { Client } from './lib/core.js'
import { Multibases } from './lib/multibases.js'
import { Multicodecs } from './lib/multicodecs.js'
import { Multihashes } from './lib/multihashes.js'
import { createLog } from './log/index.js'
import { createLs } from './ls.js'
import { createMount } from './mount.js'
import { createName } from './name/index.js'
import { createObject } from './object/index.js'
import { createPin } from './pin/index.js'
import { createPing } from './ping.js'
import { createPubsub } from './pubsub/index.js'
import { createRefs } from './refs/index.js'
import { createRepo } from './repo/index.js'
import { createResolve } from './resolve.js'
import { createRouting } from './routing/index.js'
import { createStats } from './stats/index.js'
import { createStop } from './stop.js'
import { createSwarm } from './swarm/index.js'
import { createVersion } from './version.js'
import type { KuboRPCClient as KuboRPCClientInterface, Options } from './index.ts'
import type { MultibaseCodec } from 'multiformats/bases/interface'
import type { BlockCodec } from 'multiformats/codecs/interface'
import type { MultihashHasher } from 'multiformats/hashes/interface'

class KuboRPCClient implements KuboRPCClientInterface {
  public bases: KuboRPCClientInterface['bases']
  public codecs: KuboRPCClientInterface['codecs']
  public hashers: KuboRPCClientInterface['hashers']

  public bitswap: KuboRPCClientInterface['bitswap']
  public block: KuboRPCClientInterface['block']
  public bootstrap: KuboRPCClientInterface['bootstrap']
  public config: KuboRPCClientInterface['config']
  public dag: KuboRPCClientInterface['dag']
  public dht: KuboRPCClientInterface['dht']
  public diag: KuboRPCClientInterface['diag']
  public files: KuboRPCClientInterface['files']
  public key: KuboRPCClientInterface['key']
  public log: KuboRPCClientInterface['log']
  public name: KuboRPCClientInterface['name']
  public object: KuboRPCClientInterface['object']
  public pin: KuboRPCClientInterface['pin']
  public pubsub: KuboRPCClientInterface['pubsub']
  public refs: KuboRPCClientInterface['refs']
  public repo: KuboRPCClientInterface['repo']
  public routing: KuboRPCClientInterface['routing']
  public stats: KuboRPCClientInterface['stats']
  public swarm: KuboRPCClientInterface['swarm']

  public add: KuboRPCClientInterface['add']
  public addAll: KuboRPCClientInterface['addAll']
  public cat: KuboRPCClientInterface['cat']
  public get: KuboRPCClientInterface['get']
  public ls: KuboRPCClientInterface['ls']
  public id: KuboRPCClientInterface['id']
  public version: KuboRPCClientInterface['version']
  public stop: KuboRPCClientInterface['stop']
  public ping: KuboRPCClientInterface['ping']
  public resolve: KuboRPCClientInterface['resolve']
  public commands: KuboRPCClientInterface['commands']
  public mount: KuboRPCClientInterface['mount']
  public isOnline: KuboRPCClientInterface['isOnline']
  public getEndpointConfig: KuboRPCClientInterface['getEndpointConfig']

  constructor (options: Options) {
    const client = new Client(options)

    const id: BlockCodec<any, any> = {
      name: identity.name,
      code: identity.code,
      encode: (id) => id,
      decode: (id) => id
    }

    const multibaseCodecs: Array<MultibaseCodec<string>> = Object.values(bases);
    (options.ipld?.bases ?? []).forEach(base => multibaseCodecs.push(base))

    this.bases = new Multibases({
      bases: multibaseCodecs,
      loadBase: options.ipld?.loadBase
    })

    const blockCodecs: Array<BlockCodec<any, any>> = Object.values(codecs);
    [dagPB, dagCBOR, dagJSON, dagJOSE, id].concat((options.ipld?.codecs ?? [])).forEach(codec => {
      blockCodecs.push(codec)
    })

    this.codecs = new Multicodecs({
      codecs: blockCodecs,
      loadCodec: options.ipld?.loadCodec
    })

    const multihashHashers: MultihashHasher[] = Object.values(hashes);
    (options.ipld?.hashers ?? []).forEach(hasher => multihashHashers.push(hasher))

    this.hashers = new Multihashes({
      hashers: multihashHashers,
      loadHasher: options.ipld?.loadHasher
    })

    this.bitswap = createBitswap(client)
    this.block = createBlock(client)
    this.bootstrap = createBootstrap(client)
    this.config = createConfig(client)
    this.dag = createDAG(client, this.codecs)
    this.dht = createDHT(client)
    this.diag = createDiag(client)
    this.files = createFiles(client)
    this.key = createKey(client)
    this.log = createLog(client)
    this.name = createName(client)
    this.object = createObject(client, this.codecs)
    this.pin = createPin(client)
    this.pubsub = createPubsub(client)
    this.refs = createRefs(client)
    this.repo = createRepo(client)
    this.routing = createRouting(client)
    this.stats = createStats(client)
    this.swarm = createSwarm(client)

    this.add = createAdd(client)
    this.addAll = createAddAll(client)
    this.cat = createCat(client)
    this.get = createGet(client)
    this.ls = createLs(client)
    this.id = createId(client)
    this.version = createVersion(client)
    this.stop = createStop(client)
    this.ping = createPing(client)
    this.resolve = createResolve(client)
    this.commands = createCommands(client)
    this.mount = createMount(client)
    this.isOnline = createIsOnline(client)
    this.getEndpointConfig = createGetEndpointConfig(client)
  }
}

export function createKuboRPCClient (options: Options): KuboRPCClientInterface {
  return new KuboRPCClient(options)
}
