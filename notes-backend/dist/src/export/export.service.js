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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExportService = class ExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportNote(userId, noteId, format, res) {
        const fmt = format.toLowerCase();
        if (!['txt', 'json'].includes(fmt)) {
            throw new common_1.NotFoundException('Формат не поддерживается. Используйте: txt или json');
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
            throw new common_1.NotFoundException('Заметка не найдена');
        }
        if (note.userId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой заметке');
        }
        const cleanFileName = note.title
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, '_')
            .trim() || 'note';
        switch (fmt) {
            case 'txt':
                return this.exportAsTxt(note, cleanFileName, res);
            case 'json':
                return this.exportAsJson(note, cleanFileName, res);
        }
    }
    exportAsTxt(note, fileName, res) {
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
    exportAsJson(note, fileName, res) {
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
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map