import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface LoginResponseBody {
  accessToken: string;
  refreshToken: string;
}

interface UserProfileResponseBody {
  email: string;
}

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  const httpServer = (): Parameters<typeof request>[0] =>
    app.getHttpServer() as unknown as Parameters<typeof request>[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login flow', () => {
    it('should login successfully with admin account', async () => {
      const response = await request(httpServer())
        .post('/auth/login')
        .send({
          email: 'admin@sgu.edu.vn',
          password: 'Admin@123',
        })
        .expect(200);

      const body = response.body as Partial<LoginResponseBody>;
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
    });

    it('should fail to login with wrong password', async () => {
      await request(httpServer())
        .post('/auth/login')
        .send({
          email: 'admin@sgu.edu.vn',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('RBAC Protection', () => {
    let adminToken: string;

    beforeAll(async () => {
      const response = await request(httpServer()).post('/auth/login').send({
        email: 'admin@sgu.edu.vn',
        password: 'Admin@123',
      });
      const body = response.body as LoginResponseBody;
      adminToken = body.accessToken;
    });

    it('GET /users/me should return profiles for authenticated users', async () => {
      const response = await request(httpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as UserProfileResponseBody;
      expect(body.email).toBe('admin@sgu.edu.vn');
    });

    it('GET /users/me should return 401 without token', async () => {
      await request(httpServer()).get('/users/me').expect(401);
    });

    it('GET /users should be accessible by admin', async () => {
      await request(httpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /users should return 401 for invalid token', async () => {
      await request(httpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
