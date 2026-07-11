'use strict'

const http = require('node:http')
const { loadConfig } = require('./config')
const { createApp } = require('./app')
const { FileRepository } = require('./repositories/fileRepository')

const config = loadConfig()
const repository = new FileRepository(config.dataDir)
const server = http.createServer(createApp({ repository, config }))

server.listen(config.port, () => {
  console.log(`XiaoCharFood backend listening on http://localhost:${config.port}`)
})

