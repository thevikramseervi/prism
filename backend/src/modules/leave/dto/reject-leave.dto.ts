import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectLeaveDto {
  @ApiProperty({ description: 'Reason for rejecting the leave request' })
  @IsString()
  rejection_reason: string;
}
