const {
  hashPassword,
  comparePassword,
  generateAccessToken
} = require('../src/utils/auth');

test('hash and compare password', async () => {
  const hash = await hashPassword('secret');
  const match = await comparePassword('secret', hash);
  expect(match).toBe(true);
});

test('generate access token', () => {
  process.env.JWT_ACCESS_SECRET = 'test';
  const token = generateAccessToken({ id: '123' });
  expect(typeof token).toBe('string');
});
