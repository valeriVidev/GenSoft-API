// Here we are testing if the middleware can correctly handle the JWT tokens in the authorization header to authorize requests:
//1. Missing Authorization Header: Verifies that the middleware returns a 401 status when the Authorization header is missing.
//2. Invalid Token: Ensures the middleware returns a 401 status when an invalid token is provided.
//3. Valid Token: Confirms the middleware calls next() and sets req.user correctly when a valid token is provided.




const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const verifyJWT = require('../middleware/verifyJWT');

jest.mock('jsonwebtoken');

const app = express();

app.get('/protected', verifyJWT, (req, res) => {
  res.status(200).json({ result: 'Success', user: req.user });
});

describe('verifyJWT Middleware', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env = { ...process.env, ACCESS_TOKEN_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return 401 if the authorization header is missing', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ result: 'Missing authorization header' });
  });

  it('should return 401 if the token is invalid', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'));
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
  });

  it('should call next and set req.user if the token is valid', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { username: 'testuser' });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: 'Success', user: 'testuser' });
  });
});



