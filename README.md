# kubo-rpc-client <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-kubo-rpc-client.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-kubo-rpc-client)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-kubo-rpc-client/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/ipfs/js-kubo-rpc-client/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> A client library for the Kubo RPC API

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Work In Progress](#work-in-progress)
- [Getting Started](#getting-started)
  - [Next Steps](#next-steps)
- [Usage](#usage)
    - [`create([options])`](#createoptions)
    - [Parameters](#parameters)
    - [Options](#options)
    - [Returns](#returns)
    - [Example](#example)
  - [API](#api)
  - [Additional Options](#additional-options)
  - [Instance Utils](#instance-utils)
  - [Static Types and Utils](#static-types-and-utils)
    - [Glob source](#glob-source)
      - [`globSource(path, pattern, [options])`](#globsourcepath-pattern-options)
      - [Example](#example-1)
    - [URL source](#url-source)
      - [`urlSource(url)`](#urlsourceurl)
      - [Example](#example-2)
  - [Running the daemon with the right port](#running-the-daemon-with-the-right-port)
  - [Importing the module and usage](#importing-the-module-and-usage)
  - [In a web browser](#in-a-web-browser)
  - [Custom Headers](#custom-headers)
  - [Global Timeouts](#global-timeouts)
- [Development](#development)
  - [Testing](#testing)
- [Historical context](#historical-context)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i kubo-rpc-client
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `KuboRpcClient` in the global namespace.

```html
<script src="https://unpkg.com/kubo-rpc-client/dist/index.min.js"></script>
```

## Work In Progress

This client is still a work in progress and in active development. Please refer to `ipfs-http-client` for now and only use this package if you are aware of the implications. Follow <https://github.com/ipfs/js-kubo-rpc-client/milestone/1> for tracking when this library is ready for consumption

<h1 align="center">
  <a href="https://ipfs.tech"><img width="650px" src="https://ipfs.io/ipfs/QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDgpjiSCAse" alt="Kubo RPC Client logo" /></a>
</h1>

<h3 align="center">The JavaScript RPC client library for Kubo.</h3>

<p align="center">
  <a href="https://app.element.io/#/room/#ipfs-chatter:ipfs.io"><img src="https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat" /> </a>
  <a href="https://discord.gg/ipfs"><img src="https://img.shields.io/discord/806902334369824788?color=blueviolet&label=discord&style=flat" /></a>
  <a href="https://github.com/ipfs/team-mgmt/blob/master/MGMT_JS_CORE_DEV.md"><img src="https://img.shields.io/badge/team-mgmt-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-kubo-rpc-client?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-kubo-rpc-client.svg?type=shield"/></a>
  <a href="https://codecov.io/gh/ipfs/js-kubo-rpc-client"><img src="https://img.shields.io/codecov/c/github/ipfs/js-kubo-rpc-client/master.svg?style=flat-square"></a>
   <a href="https://bundlephobia.com/result?p=kubo-rpc-client"><img src="https://flat.badgen.net/bundlephobia/minzip/kubo-rpc-client"></a>
  <br>
  <a href="https://david-dm.org/ipfs/js-kubo-rpc-client"><img src="https://david-dm.org/ipfs/js-kubo-rpc-client.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/kubo-rpc-client"><img src="https://img.shields.io/npm/dm/kubo-rpc-client.svg" /></a>
  <a href="https://www.jsdelivr.com/package/npm/kubo-rpc-client"><img src="https://data.jsdelivr.com/v1/package/npm/kubo-rpc-client/badge"/></a>
  <br>
</p>

## Getting Started

We've come a long way, but this project is still in Alpha, lots of development is happening, APIs might change, beware of 🐉..

```bash
npm install --save kubo-rpc-client
```

Both the Current and Active LTS versions of Node.js are supported. Please see [nodejs.org](https://nodejs.org/) for what these currently are.

### Next Steps

<!-- TODO: currently useless
- Read the [docs](https://ipfs.github.io/js-kubo-rpc-client)
-->

- Look into the [examples](https://github.com/ipfs-examples/js-ipfs-examples) to learn how to spawn an RPC client or a full IPFS node in Node.js and in the Browser
- Consult the [Core API docs](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) to see what you can do with an IPFS node
- Check out <https://docs.ipfs.tech> for tips, how-tos and more
- Head over to <https://proto.school> to take interactive tutorials that cover core IPFS APIs
- See <https://blog.ipfs.tech> for news and more
- Need help? Please ask 'How do I?' questions on <https://discuss.ipfs.tech>

## Usage

#### `create([options])`

> create an instance of the HTTP API client

#### Parameters

None

#### Options

`options` can be a `String`, a `URL` or a `Multiaddr` which will be interpreted as the address of the IPFS node we wish to use the API of.

Alternatively it can be an object which may have the following keys:

| Name     | Type                                                                 | Default                                          | Description                                                                                                    |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| url      | `String` or `URL` or `Multiaddr`                                     | `'http://localhost:5001/api/v0'`                 | A URL that resolves to a running instance of the IPFS [HTTP RPC API](https://docs.ipfs.io/reference/http/api/) |
| protocol | `String`                                                             | `'http'`                                         | The protocol to used (ignored if url is specified)                                                             |
| host     | `String`                                                             | `'localhost'`                                    | The host to used (ignored if url is specified)                                                                 |
| port     | `number`                                                             | `5001`                                           | The port to used (ignored if url is specified)                                                                 |
| path     | `String`                                                             | `'api/v0'`                                       | The path to used (ignored if url is specified)                                                                 |
| agent    | [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) | `http.Agent({ keepAlive: true, maxSockets: 6 })` | An `http.Agent` used to control client behaviour (node.js only)                                                |

#### Returns

| Type     | Description                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------- |
| `Object` | An object that conforms to the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) |

#### Example

```JavaScript
import { create } from 'kubo-rpc-client'

// connect to the default API address http://localhost:5001
const client = create()

// connect to a different API
const client = create({ url: "http://127.0.0.1:5002/api/v0" });

// connect using a URL
const client = create(new URL('http://127.0.0.1:5002'))

// call Core API methods
const { cid } = await client.add('Hello world!')
```

Do you use Kubo's [**`API.Authorizations`**](https://github.com/ipfs/kubo/blob/master/docs/config.md#apiauthorizations)? Check the [Custom Headers](#custom-headers) section.

### API

`kubo-rpc-client` will not implement the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api). Please see <https://github.com/ipfs/kubo/issues/9125> for more information.

### Additional Options

All core API methods take *additional* `options` specific to the HTTP API:

- `headers` - An object or [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance that can be used to set custom HTTP headers. Note that this option can also be [configured globally](#custom-headers) via the constructor options.
- `searchParams` - An object or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance that can be used to add additional query parameters to the query string sent with each request.

### Instance Utils

- `ipfs.getEndpointConfig()`

Call this on your client instance to return an object containing the `host`, `port`, `protocol` and `api-path`.

### Static Types and Utils

Aside from the default export, `kubo-rpc-client` exports various types and utilities that are included in the bundle:

- [`multiaddr`](https://www.npmjs.com/package/multiaddr)
- [`multibase`](https://www.npmjs.com/package/multibase)
- [`multicodec`](https://www.npmjs.com/package/multicodec)
- [`multihash`](https://www.npmjs.com/package/multihashes)
- [`CID`](https://www.npmjs.com/package/cids)
- [`globSource`](https://github.com/ipfs/js-ipfs-utils/blob/master/src/files/glob-source.js) (not available in the browser)
- [`urlSource`](https://github.com/ipfs/js-ipfs-utils/blob/master/src/files/url-source.js)

These can be accessed like this, for example:

```js
import { CID } from 'kubo-rpc-client'
```

#### Glob source

A utility to allow files on the file system to be easily added to IPFS.

##### `globSource(path, pattern, [options])`

- `path`: A path to a single file or directory to glob from
- `pattern`: A pattern to match files under `path`
- `options`: Optional options
- `options.hidden`: Hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

##### Example

```js
import { create, globSource } from 'ipfs'

const ipfs = await create()

for await (const file of ipfs.addAll(globSource('./docs', '**/*'))) {
  console.log(file)
}
/*
{
  path: 'docs/assets/anchor.js',
  cid: CID('QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2'),
  size: 15347
}
{
  path: 'docs/assets/bass-addons.css',
  cid: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
```

#### URL source

A utility to allow content from the internet to be easily added to IPFS.

##### `urlSource(url)`

- `url`: A string URL or [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance to send HTTP GET request to

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

##### Example

```js
import { create, urlSource } from 'kubo-rpc-client'
const ipfs = create()

const file = await ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))
console.log(file)

/*
{
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
}
*/
```

### Running the daemon with the right port

To interact with the API, you need to have a local daemon running. It needs to be open on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

```sh
# Show the ipfs config API port to check it is correct
> ipfs config Addresses.API
/ip4/127.0.0.1/tcp/5001
# Set it if it does not match the above output
> ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
# Restart the daemon after changing the config

# Run the daemon
> ipfs daemon
```

### Importing the module and usage

```javascript
import { create } from 'kubo-rpc-client'

// connect to ipfs daemon API server
const ipfs = create('http://localhost:5001') // (the default in Node.js)

// or connect with multiaddr
const ipfs = create('/ip4/127.0.0.1/tcp/5001')

// or using options
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })

// or specifying a specific API path
const ipfs = create({ host: '1.1.1.1', port: '80', apiPath: '/ipfs/api/v0' })
```

### In a web browser

**through Browserify**

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

See the example in the [examples folder](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples) to get a boilerplate.

**through webpack**

See the example in the [examples folder](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples/http-client-bundle-webpack) to get an idea on how to use `kubo-rpc-client` with webpack.

**from CDN**

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs).

To always request the latest version, use one of the following examples:

```html
<!-- loading the minified version using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/kubo-rpc-client/dist/index.min.js"></script>
```

For maximum security you may also decide to:

- reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)
- [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity. Learn more also at the [jsdelivr website](https://www.jsdelivr.com/using-sri-with-dynamic-files)
- set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script
  src="https://www.jsdelivr.com/package/npm/kubo-rpc-client"
  integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
  crossorigin="anonymous"
></script>
```

CDN-based IPFS API provides the `KuboRpcClient` object of the global `window` object. Example:

```js
const ipfs = window.KuboRpcClient.create({ host: 'localhost', port: 5001 })
```

If you omit the host and port, the client will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```js
const ipfs = window.KuboRpcClient.create()
```

### Custom Headers

If you wish to send custom headers with each request made by this library, for example, the `Authorization` header. This can be useful if your Kubo node has keys defined in [`API.Authorizations`](https://github.com/ipfs/kubo/blob/master/docs/config.md#apiauthorizations).

If you're using `bearer:token`, where `token` is `abc123`:

```js
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    authorization: 'Bearer abc123'
  }
})
```

If you're using `basic:user:password`, where `user:password` is `alice:secret`:

```js
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    // For Node.js, using:
    //    Buffer.from('alice:secret').toString('base64')
    // is preferred over using `btoa`.
    authorization: 'Basic ' + btoa('alice:secret')
  }
})
```

### Global Timeouts

To set a global timeout for *all* requests pass a value for the `timeout` option:

```js
// Timeout after 10 seconds
const ipfs = create({ timeout: 10000 })
// Timeout after 2 minutes
const ipfs = create({ timeout: '2m' })
// see https://www.npmjs.com/package/parse-duration for valid string values
```

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/src).

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-kubo-rpc-client/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
