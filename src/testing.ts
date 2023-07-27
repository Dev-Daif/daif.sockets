import { ServerWrapper } from './Wrappers/server'

const server = new ServerWrapper()

console.time()

server.listen(() => {
  console.log('Hello')
}).then(() => {
  console.log('Done')
  console.timeEnd()
})
  .catch((err) => {
    console.log(err)
  })
