import http from 'http'
import { MODE, ServerWrapper } from '../../Wrappers'
import { CloseOnAttachMode, ListenOnAttachMode } from '../../Wrappers/errors'
import { waitForClientReceiveMessage, waitForHttplisten, waitSocketConnection } from '../../Wrappers/utils'
import WebSocket from 'ws'

const PORT = 8081

describe('Server in mode [ATTACHED]', () => {
  describe('Initialize Server [ATTACHED]', () => {
    const httpServer = http.createServer()
    const SocketServer = new ServerWrapper({
      server: httpServer
    })

    test('must be created', async () => {
      expect(SocketServer.server).toBeInstanceOf(http.Server)
    })

    test('must throw if you try to listen', async () => {
      await expect(
        SocketServer.listen()
      ).rejects.toThrow(ListenOnAttachMode)
    })

    test('must be in ATTACHED mode', () => {
      expect(SocketServer.mode).toBe(MODE.ATTACHED)
    })

    test('must be listening', async () => {
      httpServer.listen(PORT, () => {
        expect(SocketServer.server?.listening).toBe(true)
      })
    })

    test('Must throw error if you try close using wrapper', async () => {
      await expect(
        SocketServer.close()
      ).rejects.toThrow(CloseOnAttachMode)
    })

    afterAll(() => {
      httpServer.close()
    })
  })

  describe('Handling Connections [WS WebSocket]', () => {
    const httpServer = http.createServer()
    const SocketServer = new ServerWrapper({
      server: httpServer
    })
    beforeAll(async () => {
      SocketServer.on('connection', (socket, {
        vanillaSocket
      }) => {
        // console.log('Con handler')
        vanillaSocket.on('message', (msg: string) => {
          vanillaSocket.send(msg)
        })
      })
      await waitForHttplisten(httpServer, PORT)
    })

    const socket = new WebSocket('ws://localhost:' + PORT.toString())

    test('socket must be connected', async () => {
      await expect(waitSocketConnection(socket)).resolves.toMatch('Connected')
    })

    test('server must have received a message and send back to client', async () => {
      socket.send('Hello')
      const message = await waitForClientReceiveMessage(socket)
      expect(message).toBe('Hello')
    })

    afterAll(async () => {
      socket.close()
      httpServer.close()
    })
  })
})
