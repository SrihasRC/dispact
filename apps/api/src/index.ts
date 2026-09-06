import { buildApp } from './app.js'

const app = await buildApp()

const host = app.config.API_HOST
const port = Number(app.config.API_PORT)

app.listen({ host, port }, (err, address) => {
  if (err != null) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`API Gateway running on ${address}`)
})
