"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../../src/auth/auth.service");
const prisma_service_1 = require("../../src/prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
describe('AuthService', () => {
    let authService;
    let prismaService;
    let jwtService;
    let configService;
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    const mockConfigService = {
        get: jest.fn((key) => {
            if (key === 'JWT_SECRET')
                return 'test-secret';
            if (key === 'JWT_EXPIRATION')
                return '7d';
            return null;
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jwtService = module.get(jwt_1.JwtService);
        configService = module.get(config_1.ConfigService);
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('register', () => {
        it('should successfully register a new user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                ...mockUser,
                passwordHash: 'hashedpassword',
            });
            const result = await authService.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            });
            expect(result).toHaveProperty('email', 'test@example.com');
            expect(result).toHaveProperty('name', 'Test User');
            expect(result).not.toHaveProperty('passwordHash');
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    passwordHash: 'hashedpassword',
                    name: 'Test User',
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
            });
        });
        it('should throw ConflictException if user already exists', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            await expect(authService.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            })).rejects.toThrow(common_1.ConflictException);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });
    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result).toHaveProperty('access_token', 'mock-jwt-token');
            expect(result).toHaveProperty('user');
            expect(result.user).toHaveProperty('id', 1);
            expect(result.user).toHaveProperty('email', 'test@example.com');
            expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@example.com' }, { secret: 'test-secret', expiresIn: '7d' });
        });
        it('should throw UnauthorizedException with invalid email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(authService.login({
                email: 'wrong@example.com',
                password: 'password123',
            })).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'wrong@example.com' },
            });
        });
        it('should throw UnauthorizedException with invalid password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            await expect(authService.login({
                email: 'test@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow(common_1.UnauthorizedException);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
        });
    });
    describe('validateUser', () => {
        it('should return user without password hash', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await authService.validateUser(1);
            expect(result).toHaveProperty('id', 1);
            expect(result).toHaveProperty('email', 'test@example.com');
            expect(result).not.toHaveProperty('passwordHash');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { id: true, email: true, name: true },
            });
        });
        it('should return null if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const result = await authService.validateUser(999);
            expect(result).toBeNull();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map