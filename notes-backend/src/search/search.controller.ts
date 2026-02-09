import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Поиск по заметкам' })
  @ApiQuery({ name: 'q', required: true, description: 'Поисковый запрос' })
  async search(
    @GetUser('id') userId: number,
    @Query('q') query: string,
  ) {
    const notes = await this.prisma.note.findMany({
      where: {
        userId,
        isDeleted: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        tags: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      query,
      results: notes,
      count: notes.length,
    };
  }
}