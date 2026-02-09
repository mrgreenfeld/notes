import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteQueryDto } from './dto/note-query.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateNoteDto) {
  const { tags, ...noteData } = dto;

  // Сначала создаем заметку
  const note = await this.prisma.note.create({
    data: {
      ...noteData,
      userId,
    },
  });

  // Затем добавляем теги, если есть
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      // Ищем существующий тег
      let tag = await this.prisma.tag.findFirst({
        where: {
          name: tagName,
          userId,
        },
      });

      // Если тег не существует, создаем его
      if (!tag) {
        tag = await this.prisma.tag.create({
          data: {
            name: tagName,
            userId,
          },
        });
      }

      // Связываем тег с заметкой
      await this.prisma.note.update({
        where: { id: note.id },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
    }
  }

  // Возвращаем заметку с тегами
  return this.prisma.note.findUnique({
    where: { id: note.id },
    include: {
      tags: true,
    },
  });
}

  async findAll(userId: number, query: NoteQueryDto) {
    const {
      search,
      tag,
      important,
      sortBy,
      sortOrder,
      page,
      limit,
      includeDeleted,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    if (important !== undefined) {
      where.isImportant = important;
    }

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: number, id: number) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!note) {
      throw new NotFoundException('Заметка не найдена');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой заметке');
    }

    return note;
  }

  async update(userId: number, id: number, dto: UpdateNoteDto) {
  await this.validateNoteOwnership(userId, id);

  const { tags, ...updateData } = dto;

  // Обновляем заметку
  const note = await this.prisma.note.update({
    where: { id },
    data: updateData,
  });

  // Обновляем теги, если они предоставлены
  if (tags !== undefined) {
    // Получаем текущие теги
    const currentNote = await this.prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    });

    // Определяем теги для удаления и добавления
    const currentTagNames = currentNote.tags.map(t => t.name);
    const newTagNames = tags || [];

    // Теги для удаления
    const tagsToRemove = currentTagNames.filter(t => !newTagNames.includes(t));
    for (const tagName of tagsToRemove) {
      const tag = await this.prisma.tag.findFirst({
        where: {
          name: tagName,
          userId,
        },
      });
      if (tag) {
        await this.prisma.note.update({
          where: { id },
          data: {
            tags: {
              disconnect: { id: tag.id },
            },
          },
        });
      }
    }

    // Теги для добавления
    const tagsToAdd = newTagNames.filter(t => !currentTagNames.includes(t));
    for (const tagName of tagsToAdd) {
      // Ищем существующий тег
      let tag = await this.prisma.tag.findFirst({
        where: {
          name: tagName,
          userId,
        },
      });

      // Если тег не существует, создаем его
      if (!tag) {
        tag = await this.prisma.tag.create({
          data: {
            name: tagName,
            userId,
          },
        });
      }

      await this.prisma.note.update({
        where: { id },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
    }
  }

  // Возвращаем обновленную заметку
  return this.prisma.note.findUnique({
    where: { id },
    include: { tags: true },
  });
}

  async remove(userId: number, id: number) {
    await this.validateNoteOwnership(userId, id);

    // Мягкое удаление
    return this.prisma.note.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async toggleImportant(userId: number, id: number) {
    await this.validateNoteOwnership(userId, id);

    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    return this.prisma.note.update({
      where: { id },
      data: {
        isImportant: !note.isImportant,
      },
    });
  }

  async getTrash(userId: number) {
    return this.prisma.note.findMany({
      where: {
        userId,
        isDeleted: true,
      },
      include: {
        tags: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });
  }

  async restore(userId: number, id: number) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Удаленная заметка не найдена');
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async permanentlyDelete(userId: number, id: number) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Удаленная заметка не найдена');
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }

  async saveDraft(userId: number, id: number, content: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (note && note.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой заметке');
    }

    if (note) {
      // Обновление существующей заметки
      return this.prisma.note.update({
        where: { id },
        data: { content },
      });
    } else {
      // Создание новой заметки как черновика
      return this.prisma.note.create({
        data: {
          title: 'Черновик',
          content,
          userId,
        },
      });
    }
  }

  private async validateNoteOwnership(userId: number, noteId: number) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Заметка не найдена');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой заметке');
    }

    return note;
  }
}