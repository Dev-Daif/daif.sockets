import http from 'http'
import { MODE, ServerWrapper } from '../../Wrappers/server'
import { NotInitializedOnEvent } from '../../Wrappers/errors/notInitializedOnEvent'

import { WebSocket } from 'ws'
import { waitForClientReceiveMessage, waitSocketConnection } from '../../Wrappers/utils'

describe('Server Wrapper', () => {
  describe('Server Handling [IF ONE OF THIS TESTS FAILS CAN CAUSE OTHERS TO FAIL]', () => {
    let SocketServer: ServerWrapper = new ServerWrapper()

    test('Server const must be an instance of ServerWrapper', () => {
      expect(SocketServer).toBeInstanceOf(ServerWrapper)
    })

    test('Server must be in SERVER MODE Cause no server passed', () => {
      expect(SocketServer.mode).toBe(MODE.SERVER)
    })

    describe('Initialize Server [NO ATTACHED]', () => {
      beforeAll(async () => {
        await SocketServer.listen()
      })

      test('Server must throw error if is initialized and you use ON("connection")', async () => {
        expect(() => {
          SocketServer.on('connection', () => { })
        }).toThrow(NotInitializedOnEvent)
      })

      test('must be created', async () => {
        expect(SocketServer.server).toBeInstanceOf(http.Server)
      })

      test('must be listening', async () => {
        expect(SocketServer.server?.listening).toBeDefined()
      })

      test('must be in SERVER mode', () => {
        expect(SocketServer.mode).toBe(MODE.SERVER)
      })

      test('must resolved with "closed" message ', async () => {
        await expect(SocketServer.close()).resolves.toMatch('closed')
      })

      afterAll(async () => {
        // console.log('Closing Server')
        await SocketServer.close()
      })

      describe('Handling Connections [WS WebSocket]', () => {
        beforeAll(async () => {
          SocketServer = new ServerWrapper()
          SocketServer.on('connection', (socket, {
            vanillaSocket
          }) => {
            // console.log('Con handler')
            vanillaSocket.on('message', (msg: string) => {
              // We are using vanilla socket so we dont use emit ClientWrapper method
              // socket.emit('message', msg)
              vanillaSocket.send(msg)
            })
          })
          await SocketServer.listen()
        })

        const socket = new WebSocket('ws://localhost:8080')

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
          await SocketServer.close()
        })
      })
    })
  })
})
