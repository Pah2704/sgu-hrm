import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

interface LoginResponseBody {
  accessToken: string;
}

interface UnitTreeNode {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string;
  status: string;
  children: UnitTreeNode[];
}

describe('Organizations (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let prisma: PrismaService;
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

    // Login as admin to get token
    const loginRes = await request(httpServer())
      .post('/auth/login')
      .send({ email: 'admin@sgu.edu.vn', password: 'Admin@123' });
    const loginBody = loginRes.body as LoginResponseBody;
    adminToken = loginBody.accessToken;

    // Clean up test data
    prisma = app.get(PrismaService);
    await prisma.unit.deleteMany({
      where: { code: 'TEST_KHOA' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /units', () => {
    it('should return the organization tree', async () => {
      const res = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const tree = res.body as UnitTreeNode[];
      expect(Array.isArray(tree)).toBe(true);
      // Should have at least the seeded root unit ("SGU")
      expect(tree.length).toBeGreaterThanOrEqual(1);
      // Root node should have expected shape
      const root = tree[0];
      expect(root).toHaveProperty('id');
      expect(root).toHaveProperty('code');
      expect(root).toHaveProperty('name');
      expect(root).toHaveProperty('children');
    });

    it('should return 401 without auth', async () => {
      await request(httpServer()).get('/units').expect(401);
    });
  });

  describe('POST /units', () => {
    it('should create a new child unit', async () => {
      // Get existing root unit
      const treeRes = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`);
      const tree = treeRes.body as UnitTreeNode[];
      const rootId = tree[0]?.id;
      expect(rootId).toBeDefined();
      if (!rootId) {
        throw new Error('Root unit not found');
      }

      const res = await request(httpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST_KHOA',
          name: 'Khoa Test',
          parentId: rootId,
          unitType: 'KHOA',
        })
        .expect(201);

      const body = res.body as UnitTreeNode;
      expect(body.code).toBe('TEST_KHOA');
      expect(body.parentId).toBe(rootId);
      expect(body.level).toBe(1);
      expect(body.path).toContain('test_khoa');
    });

    it('should reject duplicate code', async () => {
      const treeRes = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`);
      const tree = treeRes.body as UnitTreeNode[];
      const rootId = tree[0]?.id;
      expect(rootId).toBeDefined();
      if (!rootId) {
        throw new Error('Root unit not found');
      }

      await request(httpServer())
        .post('/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST_KHOA',
          name: 'Duplicate',
          parentId: rootId,
          unitType: 'KHOA',
        })
        .expect(409);
    });
  });

  describe('PATCH /units/:id', () => {
    it('should update a unit name', async () => {
      // Find the test unit we created
      const treeRes = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`);
      const tree = treeRes.body as UnitTreeNode[];
      const root = tree[0];
      const testUnit = root.children.find((c) => c.code === 'TEST_KHOA');
      expect(testUnit).toBeDefined();
      if (!testUnit) {
        throw new Error('Test unit not found');
      }

      const res = await request(httpServer())
        .patch(`/units/${testUnit.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Khoa Test Updated' })
        .expect(200);

      const body = res.body as UnitTreeNode;
      expect(body.name).toBe('Khoa Test Updated');
    });
  });

  describe('GET /units/:id/employees', () => {
    it('should return employees list (empty for new unit)', async () => {
      const treeRes = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`);
      const tree = treeRes.body as UnitTreeNode[];
      const root = tree[0];
      const testUnit = root.children.find((c) => c.code === 'TEST_KHOA');
      expect(testUnit).toBeDefined();
      if (!testUnit) {
        throw new Error('Test unit not found');
      }

      const res = await request(httpServer())
        .get(`/units/${testUnit.id}/employees`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('DELETE /units/:id', () => {
    it('should soft-delete a unit (set INACTIVE)', async () => {
      const treeRes = await request(httpServer())
        .get('/units')
        .set('Authorization', `Bearer ${adminToken}`);
      const tree = treeRes.body as UnitTreeNode[];
      const root = tree[0];
      const testUnit = root.children.find((c) => c.code === 'TEST_KHOA');
      expect(testUnit).toBeDefined();
      if (!testUnit) {
        throw new Error('Test unit not found');
      }

      const res = await request(httpServer())
        .delete(`/units/${testUnit.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as UnitTreeNode;
      expect(body.status).toBe('INACTIVE');
    });
  });
});
