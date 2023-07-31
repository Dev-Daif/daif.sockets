import { WebSocketServer, type WebSocket } from 'ws'
import http from 'http'
import { ListenOnAttachMode } from './errors/listenOnAttachMode'
import { CloseOnAttachMode } from './errors/closeOnAttachMode'
import { NotInitializedOnEvent } from './errors/notInitializedOnEvent'
interface OPTIONS {
  server?: http.Server
}

export const MODE = {
  CLIENT: 'CLIENT',
  SERVER: 'SERVER',
  DEFAULT: 'DEFAULT',
  ATTACHED: 'ATTACHED'
}

// type of key
export type ModeKey = typeof MODE[keyof typeof MODE]
export type Events = 'connection'

export class ServerWrapper {
  #server: http.Server = http.createServer()
  #mode: ModeKey = MODE.DEFAULT
  #ws: WebSocketServer = new WebSocketServer({
    server: this.#server
  })

  constructor(options?: OPTIONS) {
    const { server } = options ?? {}
    if (server == null) {
      this.#mode = MODE.SERVER
    } else {
      this.#mode = MODE.ATTACHED
      this.#server = server
      this.#ws = new WebSocketServer({
        server
      })
    }
  }

  get mode() {
    return this.#mode
  }

  async listen(port?: number, callback?: (...args: any) => void) {
    return await new Promise<ListenOnAttachMode | null>((resolve, reject) => {
      if (this.#mode === MODE.ATTACHED) {
        reject(
          new ListenOnAttachMode('You must listen on the server instance')
        ); return
      }

      const PORT = port ?? 8080

      this.#server.listen(PORT, () => {
        resolve(null)
        console.log(`Running in server mode: ${this.#mode} on port: ${PORT}`)

        /*
        this.#ws?.on('connection', (socket, req) => {
          console.log('New Connection')
          if (this.#onCallback != null) {
            console.log('Running handler')
            this.#onCallback(socket, { req })
          }
        })
        */
        if (callback != null) {
          callback()
        }
      })
    })
  }

  on(event: Events, callback: (socket: WebSocket, { req }: { req: http.IncomingMessage }) => void) {
    if (this.#server?.listening) {
      throw new NotInitializedOnEvent('You are listening before adding on event')
    }

    this.#ws.on('connection', (socket, req) => {
      callback(socket, { req })
    })
  }

  async close() {
    return await new Promise<string>((resolve, reject) => {
      if (this.#mode === MODE.ATTACHED) {
        const err = new CloseOnAttachMode('You must close the server instance')
        reject(err)
        throw err
      }

      if (this.#mode === MODE.SERVER) {
        this.#server.close(() => {
          this.#ws.close(() => {
            resolve('Server closed')
          })
        })
      }
    })
  }

  attach(server: http.Server) {
    this.#mode = MODE.ATTACHED
    this.#server = server
  }

  get server() {
    return this.#server
  }
}
