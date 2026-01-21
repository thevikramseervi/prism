import { IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IngestBiometricLogDto } from './ingest-biometric-log.dto';

export class BulkIngestBiometricLogsDto {
  @ApiProperty({
    description: 'Array of biometric logs to ingest',
    type: [IngestBiometricLogDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => IngestBiometricLogDto)
  logs: IngestBiometricLogDto[];
}
