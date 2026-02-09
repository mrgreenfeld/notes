import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Моя заметка' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Содержимое заметки...', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @ApiProperty({ example: ['работа', 'личное'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}