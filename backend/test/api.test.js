'use strict'

const assert = require('node:assert/strict')
const http = require('node:http')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { createApp } = require('../src/app')
const { FileRepository } = require('../src/repositories/fileRepository')

function createTestServer() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xcf-backend-'))
  const repository = new FileRepository(dataDir)
  const server = http.createServer(createApp({
    repository,
    config: {
      wechatAppId: '',
      wechatAppSecret: ''
    }
  }))

  return new Promise(resolve => {
    server.listen(0, () => {
      const address = server.address()
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise(done => server.close(done)),
        dataDir
      })
    })
  })
}

async function request(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    method: options.method || 'GET',
    headers: Object.assign({
      'Content-Type': 'application/json',
      'X-User-Id': options.userId || 'test-user'
    }, options.headers || {}),
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const text = await response.text()
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null
  }
}

test('health endpoint reports service status', async () => {
  const server = await createTestServer()
  try {
    const response = await request(server.baseUrl, '/health')
    assert.equal(response.status, 200)
    assert.equal(response.body.status, 'ok')
  } finally {
    await server.close()
  }
})

test('meal records are isolated by user id', async () => {
  const server = await createTestServer()
  try {
    const created = await request(server.baseUrl, '/api/meals', {
      method: 'POST',
      userId: 'alice',
      body: {
        mealType: '晚餐',
        title: '番茄牛腩',
        tags: ['家常']
      }
    })
    assert.equal(created.status, 201)
    assert.equal(created.body.title, '番茄牛腩')
    assert.ok(created.body.id)

    const aliceMeals = await request(server.baseUrl, '/api/meals', { userId: 'alice' })
    assert.equal(aliceMeals.status, 200)
    assert.equal(aliceMeals.body.length, 1)

    const bobMeals = await request(server.baseUrl, '/api/meals', { userId: 'bob' })
    assert.equal(bobMeals.status, 200)
    assert.equal(bobMeals.body.length, 0)
  } finally {
    await server.close()
  }
})

test('singleton preferences can be updated and read back', async () => {
  const server = await createTestServer()
  try {
    const saved = await request(server.baseUrl, '/api/preferences', {
      method: 'PUT',
      body: {
        tasteTags: ['清淡'],
        defaultPeople: 2
      }
    })
    assert.equal(saved.status, 200)
    assert.deepEqual(saved.body.tasteTags, ['清淡'])
    assert.equal(saved.body.defaultPeople, 2)
    assert.ok(saved.body.updatedAt)

    const loaded = await request(server.baseUrl, '/api/preferences')
    assert.deepEqual(loaded.body.tasteTags, ['清淡'])
  } finally {
    await server.close()
  }
})

test('array records can be deleted', async () => {
  const server = await createTestServer()
  try {
    const created = await request(server.baseUrl, '/api/restaurants', {
      method: 'POST',
      body: {
        name: '小馆子',
        revisitIntent: '还想再去'
      }
    })

    const deleted = await request(server.baseUrl, `/api/restaurants/${created.body.id}`, {
      method: 'DELETE'
    })
    assert.equal(deleted.status, 200)
    assert.equal(deleted.body.deleted, true)

    const list = await request(server.baseUrl, '/api/restaurants')
    assert.equal(list.body.length, 0)
  } finally {
    await server.close()
  }
})

