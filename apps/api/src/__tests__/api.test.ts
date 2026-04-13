import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import Database from 'better-sqlite3';

// Override getDatabase to use an in-memory test database
let testDb: Database.Database;

// We need to mock the database module so routes use the test DB
import { vi } from 'vitest';

vi.mock('../database/database.js', () => ({
  getDatabase: () => testDb,
  createTestDatabase: () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        actions TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    return db;
  },
  closeDatabase: () => {},
}));

beforeEach(() => {
  testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      actions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
});

const validUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  actions: ['create-item', 'view-item'],
};

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('POST /user', () => {
  it('should create a user', async () => {
    const res = await request(app).post('/user').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      actions: ['create-item', 'view-item'],
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/user')
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should reject missing first name', async () => {
    const res = await request(app)
      .post('/user')
      .send({ lastName: 'Doe', email: 'john@example.com' });
    expect(res.status).toBe(400);
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/user').send(validUser);
    const res = await request(app).post('/user').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  it('should create a user with no actions', async () => {
    const res = await request(app)
      .post('/user')
      .send({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.actions).toEqual([]);
  });

  it('should reject invalid actions', async () => {
    const res = await request(app)
      .post('/user')
      .send({ ...validUser, actions: ['invalid-action'] });
    expect(res.status).toBe(400);
  });
});

describe('GET /user', () => {
  it('should return empty array when no users', async () => {
    const res = await request(app).get('/user');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all users', async () => {
    await request(app).post('/user').send(validUser);
    await request(app)
      .post('/user')
      .send({ ...validUser, email: 'jane@example.com', firstName: 'Jane' });

    const res = await request(app).get('/user');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /user/:id', () => {
  it('should return a single user', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app).get(`/user/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('john@example.com');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/user/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('PUT /user/:id', () => {
  it('should update a user', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app).put(`/user/${created.body.id}`).send({ firstName: 'Johnny' });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Johnny');
    expect(res.body.lastName).toBe('Doe');
  });

  it('should update user actions', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app)
      .put(`/user/${created.body.id}`)
      .send({ actions: ['delete-item'] });
    expect(res.status).toBe(200);
    expect(res.body.actions).toEqual(['delete-item']);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .put('/user/00000000-0000-0000-0000-000000000000')
      .send({ firstName: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('should reject duplicate email on update', async () => {
    await request(app).post('/user').send(validUser);
    const second = await request(app)
      .post('/user')
      .send({ ...validUser, email: 'jane@example.com', firstName: 'Jane' });
    const res = await request(app)
      .put(`/user/${second.body.id}`)
      .send({ email: 'john@example.com' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /user/:id', () => {
  it('should delete a user', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app).delete(`/user/${created.body.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/user/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).delete('/user/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('POST /action', () => {
  it('should allow action if user has permission', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app)
      .post('/action')
      .send({ userId: created.body.id, action: 'create-item' });
    expect(res.status).toBe(200);
    expect(res.body.allowed).toBe(true);
    expect(res.body.action).toBe('create-item');
  });

  it('should deny action if user lacks permission', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app)
      .post('/action')
      .send({ userId: created.body.id, action: 'delete-item' });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('not allowed');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .post('/action')
      .send({ userId: '00000000-0000-0000-0000-000000000000', action: 'create-item' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid action', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app)
      .post('/action')
      .send({ userId: created.body.id, action: 'fly-to-moon' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid userId format', async () => {
    const res = await request(app)
      .post('/action')
      .send({ userId: 'not-a-uuid', action: 'create-item' });
    expect(res.status).toBe(400);
  });
});

describe('Email normalization', () => {
  it('should normalize email to lowercase on create', async () => {
    const res = await request(app)
      .post('/user')
      .send({ ...validUser, email: 'John@EXAMPLE.com' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('john@example.com');
  });

  it('should detect duplicate emails case-insensitively', async () => {
    await request(app).post('/user').send(validUser);
    const res = await request(app)
      .post('/user')
      .send({ ...validUser, email: 'JOHN@EXAMPLE.COM' });
    expect(res.status).toBe(409);
  });

  it('should trim whitespace from names', async () => {
    const res = await request(app)
      .post('/user')
      .send({
        ...validUser,
        firstName: '  Alice  ',
        lastName: '  Smith  ',
        email: 'trim@test.com',
      });
    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe('Alice');
    expect(res.body.lastName).toBe('Smith');
  });
});

describe('PUT /user/:id — edge cases', () => {
  it('should update updatedAt timestamp', async () => {
    const created = await request(app).post('/user').send(validUser);
    const original = created.body.updatedAt;

    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 10));

    const res = await request(app).put(`/user/${created.body.id}`).send({ firstName: 'Changed' });
    expect(res.status).toBe(200);
    expect(res.body.updatedAt).not.toBe(original);
  });

  it('should allow updating email to the same current email', async () => {
    const created = await request(app).post('/user').send(validUser);
    const res = await request(app)
      .put(`/user/${created.body.id}`)
      .send({ email: 'john@example.com' });
    expect(res.status).toBe(200);
  });
});

describe('GET /user — ordering', () => {
  it('should return users in descending creation order', async () => {
    await request(app).post('/user').send(validUser);
    await new Promise((r) => setTimeout(r, 10));
    await request(app)
      .post('/user')
      .send({ ...validUser, email: 'second@example.com', firstName: 'Second' });

    const res = await request(app).get('/user');
    expect(res.status).toBe(200);
    expect(res.body[0].firstName).toBe('Second');
    expect(res.body[1].firstName).toBe('John');
  });
});
