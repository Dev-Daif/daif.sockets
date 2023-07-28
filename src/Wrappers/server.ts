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

interface Config {
  port: number
}

// type of key
export type ModeKey = typeof MODE[keyof typeof MODE]
export type Events = 'connection'

export class ServerWrapper {
  #server?: http.Server
  #mode: ModeKey = MODE.DEFAULT
  #ws?: WebSocketServer
  config: Config = {
    port: 8080
  }

  #onCallback?: (...args: any) => void

  constructor(options?: OPTIONS) {
    if (options != null) {
      const { server } = options
      this.#server = server
    }
  }

  get mode() {
    return this.#mode
  }

  async listen(callback?: (...args: any) => void) {
    return await new Promise<ListenOnAttachMode | null>((resolve, reject) => {
      if (this.#mode === MODE.ATTACHED) {
        reject(
          new ListenOnAttachMode('You must listen on the server instance')
        ); return
      }

      if (this.#server == null) {
        this.#mode = MODE.SERVER
        this.#server = http.createServer()
        this.#ws = new WebSocketServer({
          server: this.#server
        })
      }

      this.#server.listen(this.config.port, () => {
        resolve(null)

        this.#ws?.on('connection', (socket, req) => {
          console.log('New Connection')
          if (this.#onCallback != null) {
            console.log('Running handler')
            this.#onCallback(socket, { req })
          }
        })
        console.log(`Running in server mode: ${this.#mode} on port: ${this.config.port}`)
        if (callback != null) {
          callback()
        }
      })
    })
  }

  on(event: Events, callback: (socket: WebSocket, { req }: { req: http.IncomingMessage }) => void) {
    if (this.#server?.listening === true) {
      throw new NotInitializedOnEvent('You must listen on the server instance')
    }
    this.#onCallback = callback
  }

  async close() {
    return await new Promise<string>((resolve, reject) => {
      if (this.#mode === MODE.ATTACHED) {
        const err = new CloseOnAttachMode('You must close the server instance')
        reject(err)
        throw err
      }

      if (this.#mode === MODE.SERVER) {
        this.#server?.close(() => {
          resolve('Server closed')
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
