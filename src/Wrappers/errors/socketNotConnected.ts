import { DaifSocketsError } from './daifSocketsError'

export class SocketNotConnected extends DaifSocketsError {
  constructor(message: string) {
    super(message)
    this.name = 'SocketNotConnected'
  }
}
