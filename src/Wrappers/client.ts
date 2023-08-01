import { WebSocket } from 'ws'
import { SocketNotConnected } from './errors/socketNotConnected'

export type CbOnMessage = (data: any) => void

export class ClientWrapper {
  url: string = ''
  #socket?: WebSocket
  constructor(client: string | WebSocket) {
    // compare if is websocket
    if (typeof client === 'string') {
      this.url = client
    } else {
      this.#socket = client
    }
    this.init()
  }

  private init() {
    let socket = this.#socket
    if (socket == null) {
      socket = new WebSocket(this.url)
      this.#socket = socket
    }

    socket.on('error', (err) => {
      console.error('Socket error', err)
    })

    socket.on('open', () => {

    })
  }

  public async connected() {
    return await new Promise<boolean>((resolve, reject) => {
      if (this.#socket == null) {
        reject(new SocketNotConnected('Socket not connected or is null'))
        return
      }
      if (this.#socket.readyState === WebSocket.OPEN) {
        resolve(true)
        return
      }

      this.#socket.on('error', (err) => {
        reject(err)
      })

      this.#socket.on('open', () => {
        resolve(true)
      })
    })
  }

  close() {
    if (this.#socket == null) {
      throw new SocketNotConnected('Socket not connected or is null')
    }
    this.#socket.close()
  }

  /**
 * Registers a callback function to be executed when the specified event occurs.
 *
 * @param {string} event - The name of the event to listen for. Must be equals as server event you are listening for
 * @param {function} callback - The function to be executed when the event occurs.
 */
  public on(event: string, callback: CbOnMessage) {
    return this.#socket?.on('message', (msg, isBinary) => {
      let messageParsed = JSON.parse(JSON.stringify(msg))
      if (Buffer.isBuffer(msg)) {
        const buf = Buffer.from(msg)
        try {
          messageParsed = JSON.parse(buf.toString('utf8'))
        } catch {
          messageParsed = msg
        }
      }

      const toEvent = messageParsed.event
      if (event === toEvent) {
        const data = messageParsed.data
        callback(data)
      }
    })
  }

  /**
   * Emits an event with the given data.
   *
   * @param {string} event - The name of the event to emit.
   * @param {string | object} data - The data to send with the event.
   */
  public async emit(event: string, data: string | object) {
    const eventData = {
      event,
      data
    }
    return await new Promise((resolve, reject) => {
      this.#socket?.send(JSON.stringify(eventData), (err) => {
        if (err != null) {
          console.error(err)
          reject(err)
          return
        }

        resolve(true)
      })
    })
  }
}
