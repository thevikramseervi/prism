import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveExceptionDto {
  @ApiProperty({ description: 'Resolution note explaining how the exception was resolved' })
  @IsString()
  resolution_note: string;
}
