import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from '../../src/notes/notes.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NotesService', () => {
  let notesService: NotesService;
  let prismaService: PrismaService;

  const mockNote = {
    id: 1,
    title: 'Test Note',
    content: 'Test content',
    isImportant: false,
    isDeleted: false,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tags: [],
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockPrisma = {
    note: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    tag: {
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    notesService = module.get<NotesService>(NotesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a note without tags', async () => {
      mockPrisma.note.create.mockResolvedValue(mockNote);
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);

      const result = await notesService.create(1, {
        title: 'Test Note',
        content: 'Test content',
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', 'Test Note');
    });

    it('should create a note with tags', async () => {
      mockPrisma.note.create.mockResolvedValue(mockNote);
      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue({ id: 1, name: 'test' });
      mockPrisma.note.update.mockResolvedValue(mockNote);
      mockPrisma.note.findUnique.mockResolvedValue({
        ...mockNote,
        tags: [{ id: 1, name: 'test' }],
      });

      const result = await notesService.create(1, {
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
      });

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('test');
    });
  });

  describe('findOne', () => {
    it('should return note if found and user owns it', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);

      const result = await notesService.findOne(1, 1);

      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      await expect(notesService.findOne(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own note', async () => {
      mockPrisma.note.findUnique.mockResolvedValue({
        ...mockNote,
        userId: 2, // Different user
      });

      await expect(notesService.findOne(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete note', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);
      mockPrisma.note.update.mockResolvedValue({
        ...mockNote,
        isDeleted: true,
        deletedAt: new Date(),
      });

      const result = await notesService.remove(1, 1);

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('toggleImportant', () => {
    it('should toggle importance status', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);
      mockPrisma.note.update.mockResolvedValue({
        ...mockNote,
        isImportant: true,
      });

      const result = await notesService.toggleImportant(1, 1);

      expect(result.isImportant).toBe(true);
    });
  });
});