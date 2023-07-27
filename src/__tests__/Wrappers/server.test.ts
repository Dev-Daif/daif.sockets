import http from 'http'
import { MODE, ServerWrapper } from '../../Wrappers/server'
import { ListenOnAttachMode } from '../../Wrappers/errors/listenOnAttachMode'
import { CloseOnAttachMode } from '../../Wrappers/errors/closeOnAttachMode'

describe('Server Wrapper', () => {
  describe('Server Handling [IF ONE OF THIS TESTS FAILS CAN CAUSE OTHERS TO FAIL]', () => {
    let SocketServer: ServerWrapper = new ServerWrapper()

    test('Server const must be an instance of ServerWrapper', () => {
      expect(SocketServer).toBeInstanceOf(ServerWrapper)
    })

    test('Server must be in DEFAULT MODE Cause is not initialized', () => {
      expect(SocketServer.mode).toBe(MODE.DEFAULT)
    })

    describe('Initialize Server [NO ATTACHED]', () => {
      beforeAll(async () => {
        await SocketServer.listen()
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

      afterAll(() => {
        console.log('Closing Server')
        void SocketServer.close()
      })
    })

    describe('Initialize Server [ATTACHED]', () => {
      const httpServer = http.createServer()
      beforeAll(async () => {
        SocketServer = new ServerWrapper()
        SocketServer.attach(httpServer)
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
        httpServer.listen(8080, () => {
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
  })
})
