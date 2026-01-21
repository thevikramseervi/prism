import { IsUUID, IsDateString, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty()
  @IsUUID()
  lab_member_id: string;

  @ApiProperty({ enum: ['CASUAL_LEAVE'] })
  @IsEnum(['CASUAL_LEAVE'])
  leave_type: string;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  end_date: string;

  @ApiProperty({ enum: ['FULL_DAY', 'HALF_DAY'] })
  @IsEnum(['FULL_DAY', 'HALF_DAY'])
  duration: string;

  @ApiProperty({ enum: ['FIRST_HALF', 'SECOND_HALF'], required: false })
  @IsOptional()
  @IsEnum(['FIRST_HALF', 'SECOND_HALF'])
  half_day_period?: string;

  @ApiProperty()
  @IsString()
  reason: string;
}
