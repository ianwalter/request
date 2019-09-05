const { test } = require('@ianwalter/bff')
const createTestServer = require('@ianwalter/test-server')
const { requester, Requester } = require('.')

test('GET request for empty response', async ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.status = 204))
  const response = await requester.get(server.url)
  expect(response.ok).toBe(true)
  expect(response.statusCode).toBe(204)
  expect(response.body).toBe(undefined)
  await server.close()
})

test('GET request for text', async ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.body = 'test'))
  const response = await requester.get(server.url)
  expect(response.ok).toBe(true)
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe('test')
  await server.close()
})

test('GET request for JSON', async ({ expect }) => {
  const server = await createTestServer()
  const body = { message: 'test' }
  server.use(ctx => (ctx.body = body))
  const response = await requester.get(server.url)
  expect(response.ok).toBe(true)
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual(body)
  await server.close()
})

test('POST request with JSON', async ({ expect }) => {
  const server = await createTestServer()
  const body = { chef: 'Sanchez' }
  server.use(ctx => {
    ctx.status = ctx.request.body.chef === body.chef ? 201 : 400
    ctx.body = ctx.request.body
  })
  const response = await requester.post(server.url, { body })
  expect(response.ok).toBe(true)
  expect(response.statusCode).toBe(201)
  expect(response.body).toEqual(body)
  await server.close()
})

test('Unauthorized GET request', async ({ expect }) => {
  const server = await createTestServer()
  server.use(ctx => (ctx.status = 401))
  try {
    await requester.get(server.url)
  } catch (err) {
    expect(err.response.ok).toBe(false)
    expect(err.response.statusCode).toBe(401)
    expect(err.response.body).toBe('Unauthorized')
  }
  await server.close()
})

test('Bad Request with shouldThrow = false', async ({ expect }) => {
  const requester = new Requester({ shouldThrow: false })
  const server = await createTestServer()
  const body = { message: 'Ungodly gorgeous, buried in a chorus' }
  server.use(ctx => {
    ctx.status = 400
    ctx.body = body
  })
  const response = await requester.get(server.url)
  expect(response.ok).toBe(false)
  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual(body)
  await server.close()
})
