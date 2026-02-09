"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotesService = class NotesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const { tags, ...noteData } = dto;
        const note = await this.prisma.note.create({
            data: {
                ...noteData,
                userId,
            },
        });
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tag = await this.prisma.tag.findFirst({
                    where: {
                        name: tagName,
                        userId,
                    },
                });
                if (!tag) {
                    tag = await this.prisma.tag.create({
                        data: {
                            name: tagName,
                            userId,
                        },
                    });
                }
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
        return this.prisma.note.findUnique({
            where: { id: note.id },
            include: {
                tags: true,
            },
        });
    }
    async findAll(userId, query) {
        const { search, tag, important, sortBy, sortOrder, page, limit, includeDeleted, } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
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
    async findOne(userId, id) {
        const note = await this.prisma.note.findUnique({
            where: { id },
            include: { tags: true },
        });
        if (!note) {
            throw new common_1.NotFoundException('Заметка не найдена');
        }
        if (note.userId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой заметке');
        }
        return note;
    }
    async update(userId, id, dto) {
        await this.validateNoteOwnership(userId, id);
        const { tags, ...updateData } = dto;
        const note = await this.prisma.note.update({
            where: { id },
            data: updateData,
        });
        if (tags !== undefined) {
            const currentNote = await this.prisma.note.findUnique({
                where: { id },
                include: { tags: true },
            });
            const currentTagNames = currentNote.tags.map(t => t.name);
            const newTagNames = tags || [];
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
            const tagsToAdd = newTagNames.filter(t => !currentTagNames.includes(t));
            for (const tagName of tagsToAdd) {
                let tag = await this.prisma.tag.findFirst({
                    where: {
                        name: tagName,
                        userId,
                    },
                });
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
        return this.prisma.note.findUnique({
            where: { id },
            include: { tags: true },
        });
    }
    async remove(userId, id) {
        await this.validateNoteOwnership(userId, id);
        return this.prisma.note.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async toggleImportant(userId, id) {
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
    async getTrash(userId) {
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
    async restore(userId, id) {
        const note = await this.prisma.note.findFirst({
            where: {
                id,
                userId,
                isDeleted: true,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException('Удаленная заметка не найдена');
        }
        return this.prisma.note.update({
            where: { id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });
    }
    async permanentlyDelete(userId, id) {
        const note = await this.prisma.note.findFirst({
            where: {
                id,
                userId,
                isDeleted: true,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException('Удаленная заметка не найдена');
        }
        return this.prisma.note.delete({
            where: { id },
        });
    }
    async saveDraft(userId, id, content) {
        const note = await this.prisma.note.findUnique({
            where: { id },
        });
        if (note && note.userId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой заметке');
        }
        if (note) {
            return this.prisma.note.update({
                where: { id },
                data: { content },
            });
        }
        else {
            return this.prisma.note.create({
                data: {
                    title: 'Черновик',
                    content,
                    userId,
                },
            });
        }
    }
    async validateNoteOwnership(userId, noteId) {
        const note = await this.prisma.note.findUnique({
            where: { id: noteId },
        });
        if (!note) {
            throw new common_1.NotFoundException('Заметка не найдена');
        }
        if (note.userId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой заметке');
        }
        return note;
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map