export class DaifSocketsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DaifSocketsError'
  }
}
