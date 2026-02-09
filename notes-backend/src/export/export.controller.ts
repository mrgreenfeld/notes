import { Controller, Get, Param, Res, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('notes/:id')
  @ApiOperation({ summary: 'Экспорт заметки в различных форматах' })
  @ApiQuery({ 
    name: 'format', 
    enum: ['txt', 'json'], 
    required: false,
    description: 'Формат экспорта: txt или json'
  })
  async exportNote(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('format') format: string = 'txt', // Значение по умолчанию
    @Res() res: Response,
  ) {
    await this.exportService.exportNote(userId, id, format, res);
  }
}