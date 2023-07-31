import type http from 'http'
import { type WebSocket as WebSocketType } from 'ws'
export const waitSocketConnection = async (socket: WebSocketType) => await new Promise<string>((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('Socket connection timeout'))
  }, 2000)
  socket.on('error', () => {
    // console.log('Error connection')
    reject(new Error('Socket error'))
    clearTimeout(timeout)
  })

  socket.on('open', () => {
    // console.log('Connected')
    resolve('Connected')
    clearTimeout(timeout)
  })
})

export const waitForClientReceiveMessage = async (socket: WebSocketType) => {
  return await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Socket client receive message timeout'))
    }, 2000)
    socket.on('message', (msg) => {
      resolve(msg.toString())
      clearTimeout(timeout)
    })
  })
}

export const waitForHttplisten = async (server: http.Server, port: number) => {
  return await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server listen timeout'))
    }, 2000)
    server.listen(port ?? 8080, () => {
      // console.log('Running in server mode: ' + port.toString())
      resolve('Connected')
      clearTimeout(timeout)
    })
  })
}
