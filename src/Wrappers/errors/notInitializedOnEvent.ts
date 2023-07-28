import { DaifSocketsError } from './daifSocketsError'

export class NotInitializedOnEvent extends DaifSocketsError {
  constructor(message: string) {
    super(message)
    this.name = 'NotInitializedOnEvent'
  }
}
