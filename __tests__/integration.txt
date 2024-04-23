const supertest = require('supertest');
const app = require('../app.js'); // Adjust this path to where your Express app is exported

const request = supertest(app);
let accessToken = null

describe('Authentication API', () => {
    it('should login a user with correct credentials', async () => {
        const response = await request.post('/api/auth/login')
            .send({
                username: 'TestUser1',
                password: 'TestPassword1.'
            })
            .expect(200);

        expect(response.body.result).toHaveProperty('access_token');
        accessToken = response.body.result.access_token
    });
    it('should properly logout the user and return status 204', async () => {
        await request.post('/api/auth/logout')
            .expect(204);
    });
});

describe('User handling', () => {
    it('should create a new user and return status 201 with a result message', async () => {
        const response = await request.post('/api/user/create')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({
                username: "TestUser2",
                password: "TestPassword2.",
                password_repeat: "TestPassword2."
            });

        expect(response.status).toBe(201);
        expect(response.body.result).toEqual("User created.");
    });

    it('should update a user and return status 200 with a confirmation message', async () => {
        const response = await request.put('/api/user/update')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({
                username: "TestUser2",
                new_password: "TestPassword2.New",
                password_repeat: "TestPassword2.New"
            });

        expect(response.status).toBe(200);
        expect(response.body.result).toEqual("User updated.");
    });

    it('should delete a user and return status 200 with a confirmation message', async () => {
        const response = await request.delete('/api/user/delete')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({ username: "TestUser2" });

        expect(response.status).toBe(200);
        expect(response.body.result).toEqual("User deleted successfully.");
    });
});