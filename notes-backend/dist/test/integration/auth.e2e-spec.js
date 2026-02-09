"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../../src/app.module");
const prisma_service_1 = require("../../src/prisma/prisma.service");
describe('AuthController (e2e)', () => {
    let app;
    let prisma;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get(prisma_service_1.PrismaService);
        await app.init();
        await prisma.user.deleteMany();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('/auth/register (POST)', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            })
                .expect(201)
                .expect((res) => {
                expect(res.body.email).toBe('test@example.com');
                expect(res.body.name).toBe('Test User');
                expect(res.body).not.toHaveProperty('password');
            });
        });
        it('should return 409 if email already exists', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
            })
                .expect(201);
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
            })
                .expect(409);
        });
    });
    describe('/auth/login (POST)', () => {
        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'login@example.com',
                password: 'password123',
            });
        });
        it('should login with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                email: 'login@example.com',
                password: 'password123',
            })
                .expect(200)
                .expect((res) => {
                expect(res.body.access_token).toBeDefined();
                expect(res.body.user.email).toBe('login@example.com');
            });
        });
        it('should return 401 with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                email: 'login@example.com',
                password: 'wrongpassword',
            })
                .expect(401);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map