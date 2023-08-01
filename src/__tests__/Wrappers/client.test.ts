import { ClientWrapper, ServerWrapper } from '../../Wrappers'
import { waitForClientReceiveMessage } from '../../Wrappers/utils'

describe('Client Wrapper', () => {
  const server = new ServerWrapper()
  beforeAll(async () => {
    // This event emits back the message receive in server to client.
    // Is used for test on / emit events
    server.on('connection', (socket) => {
      socket.on('message', (msg: string) => {
        socket.send(msg)
      })
    })
    await server.listen(8080)
  })

  const client = new ClientWrapper('ws://localhost:8080')

  describe('Methods', () => {
    describe('.on', () => {
      test('defined', () => {
        expect(client.on).toBeDefined()
      })
    })

    describe('.emit', () => {
      test('defined', () => {
        expect(client.emit).toBeDefined()
      })
    })

    describe('.connected', () => {
      test('defined', () => {
        expect(client.connected).toBeDefined()
      })

      test('must return a promise', () => {
        expect(client.connected()).toBeInstanceOf(Promise)
      })

      test('must resolve to true [Connected]', async () => {
        await expect(client.connected()).resolves.toBeTruthy()
      })
    })
  })

  describe('Handling connection, events', () => {
    test('must be connected', async () => {
      await expect(client.connected()).resolves.toBeTruthy()
    })

    test('Must send a message to server', async () => {
      const message = {
        event: 'message',
        data: {
          message: 'hola'
        }
      }
      await expect(client.emit('message', message)).resolves.toBeTruthy()
    })

    test('must receive back the message sended before from server', async () => {
      const message = {
        event: 'message',
        data: {
          message: 'hola'
        }
      }

      let messageReceived = ''
      // keep in mind we use the 'message' event to re-use the previous vanilla socket util
      client.on('message', (msg) => {
        messageReceived = msg
      })
      await waitForClientReceiveMessage(client)
      expect(messageReceived).toEqual(message)
    })

    afterAll(async () => {
      client.close()
      await server.close()
    })
  })
})
