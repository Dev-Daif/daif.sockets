import http from 'http'
import { ListenOnAttachMode } from './errors/listenOnAttachMode'
import { CloseOnAttachMode } from './errors/closeOnAttachMode'
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

export class ServerWrapper {
  #server?: http.Server
  #mode: ModeKey = MODE.DEFAULT
  config: Config = {
    port: 8080
  }

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
      }

      this.#server.listen(this.config.port, () => {
        resolve(null)
        console.log(`Running in server mode: ${this.#mode} on port: ${this.config.port}`)
        if (callback != null) {
          callback()
        }
      })
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
