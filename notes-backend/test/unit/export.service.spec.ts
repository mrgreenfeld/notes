import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from '../../src/export/export.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ExportService', () => {
  let exportService: ExportService;
  let prismaService: PrismaService;

  const mockNote = {
    id: 1,
    title: 'Тестовая заметка',
    content: 'Содержимое заметки',
    isImportant: true,
    isDeleted: false,
    userId: 1,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
    deletedAt: null,
    tags: [
      { id: 1, name: 'работа', color: '#3b82f6' },
      { id: 2, name: 'важно', color: '#ef4444' },
    ],
    user: {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
    },
  };

  const mockPrisma = {
    note: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    exportService = module.get<ExportService>(ExportService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('exportNote', () => {
    it('should throw NotFoundException if note not found', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      await expect(
        exportService.exportNote(1, 999, 'txt', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own note', async () => {
      mockPrisma.note.findUnique.mockResolvedValue({
        ...mockNote,
        userId: 2, // Different user
      });

      await expect(
        exportService.exportNote(1, 1, 'txt', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('export formats', () => {
    beforeEach(() => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);
    });

    it('should export as TXT', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await exportService.exportNote(1, 1, 'txt', mockResponse as any);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      expect(mockResponse.send).toHaveBeenCalled();
      const content = mockResponse.send.mock.calls[0][0];
      expect(content).toContain('Тестовая заметка');
      expect(content).toContain('⭐ Важная заметка');
      expect(content).toContain('работа, важно');
    });

    it('should export as JSON', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      await exportService.exportNote(1, 1, 'json', mockResponse as any);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json; charset=utf-8',
      );
      expect(mockResponse.json).toHaveBeenCalled();
      const data = mockResponse.json.mock.calls[0][0];
      expect(data.title).toBe('Тестовая заметка');
      expect(data.tags).toHaveLength(2);
      expect(data.metadata.format).toBe('json');
    });
  });
});