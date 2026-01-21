import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPaymentBandDto {
  @ApiProperty({
    example: 'payment-band-uuid-here',
    description: 'Payment band ID',
  })
  @IsUUID()
  payment_band_id: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Assignment effective from date',
  })
  @IsDateString()
  assigned_from: string;
}
