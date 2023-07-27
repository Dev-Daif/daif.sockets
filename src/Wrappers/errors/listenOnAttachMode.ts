import { DaifSocketsError } from './daifSocketsError'

export class ListenOnAttachMode extends DaifSocketsError {
  constructor(message: string) {
    super(message)
    this.name = 'ListenOnAttachMode'
  }
}
