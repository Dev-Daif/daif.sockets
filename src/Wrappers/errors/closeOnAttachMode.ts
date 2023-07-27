import { DaifSocketsError } from './daifSocketsError'

export class CloseOnAttachMode extends DaifSocketsError {
  constructor(message: string) {
    super(message)
    this.name = 'CloseOnAttachMode'
  }
}
