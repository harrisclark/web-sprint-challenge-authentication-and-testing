// Write your tests here
const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig')

beforeAll( async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach( async () => {
  await db.seed.run()
})

afterAll( async () => {
  await db.destroy()
})

describe('POST api/auth/register', () => {
  test('can register new user with valid username and password', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'foo', password: 'bar' });
    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({ username: 'foo'})
  });

  test('user will not be registered on invalid username or password', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '     ', password: 'baz' });
    expect(result.status).toBe(401)
    expect(result.body).toMatchObject({ message: "username and password required" })
  });
});

describe('POST api/auth/login', () => {
  test('user can login on valid credentials', async () => {
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'hugo', password: '1234' });
    expect(result.body.token).toBeDefined();
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({ message: "welcome, hugo"})
  });

  test('login fails on invalid credetials and is not assigned a token', async () => {
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'hugo', password: '12345' });
    expect(result.status).toBe(401)
    expect(result.body.message).toBe('invalid credentials')
    expect(result.body.token).not.toBeDefined()
  });
});


