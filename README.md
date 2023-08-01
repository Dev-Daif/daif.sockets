# Daif Sockets Library

## Install

```
npm install daif.sockets

pnpm install daif.sockets

yarn add daif.sockets
```

### This library is still under development. We don't recommend using it in production environments at this time.

The next feature should be support for CloudFlare Workers Sockets.

We are planning to make a Deno version. Please leave a star in the GitHub repository to let us know you like our library.


## Explanation

The idea of this library is to provide a **Wrapper** around the vanilla **Websocket** and **WebSocketServer** from [**WS**](https://www.npmjs.com/package/ws) package.

## Documentation

The documentation is coming soon, but the examples below should help you get started using the library.

### Basic Server (Not attached)
```js
import { ServerWrapper } from 'daif.sockets'

const server = new ServerWrapper();

server.on('connection', (socket)=>{
  // Socket is an instance of our `ClientWrapper` class.
  // Do whatever with socket
})

server.listen(3000)
// Server runs in 3000, if port not provided runs in 8080
```

### Basic Server (Attached)

If you want to attach an instance of `http` you can pass it in parameter to the `ServerWrapper`
```js
import { ServerWrapper } from 'daif.sockets'
import http from 'node:http'

const httpServer = http.createServer()
const server = new ServerWrapper({
  server: httpServer
});

server.on('connection', (socket)=>{
  // Socket is an instance of our `ClientWrapper` class.
  // Do whatever with socket
})

httpServer.listen(3000)
```

**Note:** If you pass a `http` instance to the `ServerWrapper` constructor, you must call the `listen()` method on the instance.

### Client Usage (Initialization)

```js
import { ClientWrapper } from 'daif.sockets'

const client = new ClientWrapper('ws://localhost:8080')
```
OR
```js
import { ClientWrapper } from 'daif.sockets'

// WebSocket should be from WS or JavaScript Class
const socket = new WebSocket('ws://localhost:8080')
const client = new ClientWrapper(socket)
```

### Sending events

```js
// ... <- The client initialization you select 

// Wait for socket connection
await client.connected()

client.emit('event', {
  message: 'Hello'
})
```

### Listening events

We are assuming that this event causes the server to return the same message as the one sent from the client.
```js
// ... <- The client initialization you select 

client.on('event', (data)=>{
  console.log(data)
  /*
   {
    message: 'Hello'
   }
  */
})
```