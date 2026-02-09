import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteQueryDto } from './dto/note-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую заметку' })
  create(@GetUser('id') userId: number, @Body() dto: CreateNoteDto) {
    return this.notesService.create(userId, dto);
  }

  @Get()
@ApiOperation({ summary: 'Получить список заметок' })
@ApiQuery({ name: 'search', required: false, description: 'Поиск по заголовку и содержимому' })
@ApiQuery({ name: 'tag', required: false, description: 'Фильтр по тегу' })
@ApiQuery({ name: 'important', required: false, description: 'Только важные заметки', type: Boolean })
@ApiQuery({ name: 'sortBy', required: false, enum: ['title', 'createdAt', 'updatedAt'], description: 'Поле для сортировки' })
@ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Порядок сортировки' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество на странице' })
@ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Включая удаленные' })
findAll(@GetUser('id') userId: number, @Query() query: NoteQueryDto) {
  return this.notesService.findAll(userId, query);
}

  @Get('trash')
  @ApiOperation({ summary: 'Получить заметки в корзине' })
  getTrash(@GetUser('id') userId: number) {
    return this.notesService.getTrash(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заметку по ID' })
  findOne(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.notesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заметку' })
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(userId, id, dto);
  }

  @Patch(':id/important')
  @ApiOperation({ summary: 'Переключить статус важности' })
  toggleImportant(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notesService.toggleImportant(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заметку в корзину' })
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.notesService.remove(userId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Восстановить заметку из корзины' })
  restore(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.notesService.restore(userId, id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Окончательно удалить заметку' })
  permanentlyDelete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notesService.permanentlyDelete(userId, id);
  }

  @Post(':id/draft')
  @ApiOperation({ summary: 'Сохранить черновик' })
  saveDraft(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ) {
    return this.notesService.saveDraft(userId, id, content);
  }
}