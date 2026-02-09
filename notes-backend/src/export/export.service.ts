import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportNote(
    userId: number,
    noteId: number,
    format: string,
    res: Response,
  ) {
    // Приводим формат к нижнему регистру
    const fmt = format.toLowerCase();
    
    // Проверяем допустимые форматы
    if (!['txt', 'json'].includes(fmt)) {
      throw new NotFoundException('Формат не поддерживается. Используйте: txt или json');
    }

    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { 
        tags: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
    });

    if (!note) {
      throw new NotFoundException('Заметка не найдена');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой заметке');
    }

    // Очищаем имя файла от недопустимых символов
    const cleanFileName = note.title
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .trim() || 'note';
    
    switch (fmt) {
      case 'txt':
        return this.exportAsTxt(note, cleanFileName, res);
      case 'json':
        return this.exportAsJson(note, cleanFileName, res);
      // PDF больше нет в списке
    }
  }

  private exportAsTxt(note: any, fileName: string, res: Response) {
    const content = `
${note.title}
${'='.repeat(Math.min(note.title.length, 50))}

Дата создания: ${note.createdAt.toLocaleString('ru-RU')}
Дата изменения: ${note.updatedAt.toLocaleString('ru-RU')}
Автор: ${note.user.name || note.user.email}
${note.isImportant ? '⭐ Важная заметка' : ''}
Теги: ${note.tags.map(t => t.name).join(', ') || 'нет'}

${note.content || ''}
    `.trim();

    const encodedFileName = encodeURIComponent(fileName + '.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
    res.send(content);
  }

  private exportAsJson(note: any, fileName: string, res: Response) {
    const exportData = {
      id: note.id,
      title: note.title,
      content: note.content,
      isImportant: note.isImportant,
      isDeleted: note.isDeleted,
      tags: note.tags.map(t => ({ name: t.name, color: t.color })),
      author: {
        name: note.user.name,
        email: note.user.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0',
      },
    };

    const encodedFileName = encodeURIComponent(fileName + '.json');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
    res.json(exportData);
  }
}