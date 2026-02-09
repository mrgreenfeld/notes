"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
describe('NotesController (e2e)', () => {
    let app;
    let prisma;
    let authToken;
    let userId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get(prisma_service_1.PrismaService);
        await app.init();
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
                name: 'Test User',
            },
        });
        userId = user.id;
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
            email: 'test@example.com',
            password: 'password123',
        });
        authToken = loginResponse.body.access_token;
    });
    afterAll(async () => {
        await prisma.user.deleteMany();
        await app.close();
    });
    describe('/notes (POST)', () => {
        it('should create a note', () => {
            return request(app.getHttpServer())
                .post('/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'Test Note',
                content: 'Test content',
                tags: ['test', 'important'],
            })
                .expect(201)
                .expect((res) => {
                expect(res.body.title).toBe('Test Note');
                expect(res.body.tags).toHaveLength(2);
            });
        });
    });
    describe('/notes (GET)', () => {
        it('should get notes list', () => {
            return request(app.getHttpServer())
                .get('/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                expect(res.body.data).toBeInstanceOf(Array);
                expect(res.body.meta).toHaveProperty('total');
            });
        });
        it('should filter by tag', async () => {
            await request(app.getHttpServer())
                .post('/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'Tagged Note',
                content: 'Content',
                tags: ['filter-test'],
            });
            return request(app.getHttpServer())
                .get('/notes?tag=filter-test')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                expect(res.body.data.length).toBeGreaterThan(0);
                expect(res.body.data[0].tags[0].name).toBe('filter-test');
            });
        });
    });
    describe('/notes/:id (DELETE)', () => {
        let noteId;
        beforeEach(async () => {
            const note = await prisma.note.create({
                data: {
                    title: 'To Delete',
                    content: 'Content',
                    userId,
                },
            });
            noteId = note.id;
        });
        it('should soft delete note', () => {
            return request(app.getHttpServer())
                .delete(`/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect(async () => {
                const deletedNote = await prisma.note.findUnique({
                    where: { id: noteId },
                });
                expect(deletedNote.isDeleted).toBe(true);
            });
        });
    });
});
//# sourceMappingURL=notes.e2e-spec.js.map