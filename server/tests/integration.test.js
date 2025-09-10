const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongo;

beforeAll(async () => {
  try {
    mongo = await MongoMemoryServer.create({ binary: { version: '7.0.3' } });
    const uri = mongo.getUri();
    process.env.JWT_ACCESS_SECRET = 'test';
    process.env.JWT_REFRESH_SECRET = 'test2';
    process.env.MONGODB_URI = uri;
    process.env.CLIENT_URL = 'http://localhost:3000';
    app = require('../src/index');
    await mongoose.connect(uri);
  } catch (err) {
    console.warn('Skipping integration tests: cannot start MongoMemoryServer', err.message);
  }
});

afterAll(async () => {
  if (mongo) {
    await mongoose.disconnect();
    await mongo.stop();
  }
});

describe('auth flow', () => {
  const testFn = mongo ? test : test.skip;
  testFn('signup and login', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'a@b.com',
      username: 'ab',
      password: 'secret1'
    });
    const res = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'ab',
      password: 'secret1'
    });
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
  });
});
