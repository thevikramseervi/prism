import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: 'Republic Day' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2024-01-26' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['INSTITUTE', 'LAB'] })
  @IsEnum(['INSTITUTE', 'LAB'])
  holiday_type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
