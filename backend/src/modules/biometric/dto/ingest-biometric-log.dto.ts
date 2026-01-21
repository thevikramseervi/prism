import { IsString, IsDateString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum BiometricEventType {
  IN = 'IN',
  OUT = 'OUT',
  UNKNOWN = 'UNKNOWN',
}

export class IngestBiometricLogDto {
  @ApiProperty({
    example: 'DEVICE-001',
    description: 'Biometric device identifier',
  })
  @IsString()
  device_id: string;

  @ApiProperty({
    example: 'BIO12345',
    description: 'Biometric user ID from device',
  })
  @IsString()
  biometric_user_id: string;

  @ApiProperty({
    example: '2024-01-15T09:30:00Z',
    description: 'Device timestamp (ISO 8601)',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    example: 'IN',
    description: 'Event type: IN, OUT, or UNKNOWN',
    enum: BiometricEventType,
  })
  @IsEnum(BiometricEventType)
  event_type: string;

  @ApiProperty({
    example: { deviceModel: 'Biometric-X200', firmwareVersion: '1.2.3' },
    description: 'Raw data from device (optional, for debugging)',
    required: false,
  })
  @IsOptional()
  @IsObject()
  raw_data?: any;
}
