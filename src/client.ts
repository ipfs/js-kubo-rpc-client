import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as dagPB from '@ipld/dag-pb'
import * as dagJOSE from 'dag-jose'
import { bases, hashes, codecs } from 'multiformats/basics'
import { identity } from 'multiformats/hashes/identity'
import { createAddAll } from './add-all.ts'
import { createAdd } from './add.ts'
import { createBitswap } from './bitswap/index.ts'
import { createBlock } from './block/index.ts'
import { createBootstrap } from './bootstrap/index.ts'
import { createCat } from './cat.ts'
import { createCommands } from './commands.ts'
import { createConfig } from './config/index.ts'
import { createDAG } from './dag/index.ts'
import { createDHT } from './dht/index.ts'
import { createDiag } from './diag/index.ts'
import { createFiles } from './files/index.ts'
import { createGetEndpointConfig } from './get-endpoint-config.ts'
import { createGet } from './get.ts'
import { createId } from './id.ts'
import { createIsOnline } from './is-online.ts'
import { createKey } from './key/index.ts'
import { Client } from './lib/core.ts'
import { Multibases } from './lib/multibases.ts'
import { Multicodecs } from './lib/multicodecs.ts'
import { Multihashes } from './lib/multihashes.ts'
import { createLog } from './log/index.ts'
import { createLs } from './ls.ts'
import { createMount } from './mount.ts'
import { createName } from './name/index.ts'
import { createObject } from './object/index.ts'
import { createPin } from './pin/index.ts'
import { createPing } from './ping.ts'
import { createProvide } from './provide/index.ts'
import { createPubsub } from './pubsub/index.ts'
import { createRefs } from './refs/index.ts'
import { createRepo } from './repo/index.ts'
import { createResolve } from './resolve.ts'
import { createRouting } from './routing/index.ts'
import { createStats } from './stats/index.ts'
import { createStop } from './stop.ts'
import { createSwarm } from './swarm/index.ts'
import { createVersion } from './version.ts'
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
  public provide: KuboRPCClientInterface['provide']

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
    this.provide = createProvide(client)

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
