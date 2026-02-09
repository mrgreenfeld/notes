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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const notes_service_1 = require("./notes.service");
const create_note_dto_1 = require("./dto/create-note.dto");
const update_note_dto_1 = require("./dto/update-note.dto");
const note_query_dto_1 = require("./dto/note-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let NotesController = class NotesController {
    constructor(notesService) {
        this.notesService = notesService;
    }
    create(userId, dto) {
        return this.notesService.create(userId, dto);
    }
    findAll(userId, query) {
        return this.notesService.findAll(userId, query);
    }
    getTrash(userId) {
        return this.notesService.getTrash(userId);
    }
    findOne(userId, id) {
        return this.notesService.findOne(userId, id);
    }
    update(userId, id, dto) {
        return this.notesService.update(userId, id, dto);
    }
    toggleImportant(userId, id) {
        return this.notesService.toggleImportant(userId, id);
    }
    remove(userId, id) {
        return this.notesService.remove(userId, id);
    }
    restore(userId, id) {
        return this.notesService.restore(userId, id);
    }
    permanentlyDelete(userId, id) {
        return this.notesService.permanentlyDelete(userId, id);
    }
    saveDraft(userId, id, content) {
        return this.notesService.saveDraft(userId, id, content);
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новую заметку' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_note_dto_1.CreateNoteDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список заметок' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Поиск по заголовку и содержимому' }),
    (0, swagger_1.ApiQuery)({ name: 'tag', required: false, description: 'Фильтр по тегу' }),
    (0, swagger_1.ApiQuery)({ name: 'important', required: false, description: 'Только важные заметки', type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, enum: ['title', 'createdAt', 'updatedAt'], description: 'Поле для сортировки' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Порядок сортировки' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Номер страницы' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество на странице' }),
    (0, swagger_1.ApiQuery)({ name: 'includeDeleted', required: false, type: Boolean, description: 'Включая удаленные' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, note_query_dto_1.NoteQueryDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('trash'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить заметки в корзине' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "getTrash", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить заметку по ID' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить заметку' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_note_dto_1.UpdateNoteDto]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/important'),
    (0, swagger_1.ApiOperation)({ summary: 'Переключить статус важности' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "toggleImportant", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить заметку в корзину' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Восстановить заметку из корзины' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, swagger_1.ApiOperation)({ summary: 'Окончательно удалить заметку' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "permanentlyDelete", null);
__decorate([
    (0, common_1.Post)(':id/draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Сохранить черновик' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "saveDraft", null);
exports.NotesController = NotesController = __decorate([
    (0, swagger_1.ApiTags)('notes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map