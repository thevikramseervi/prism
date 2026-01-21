import { IsUUID, IsDateString, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualAttendanceDto {
  @ApiProperty()
  @IsUUID()
  lab_member_id: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['FULL_DAY', 'HALF_DAY', 'LOP'] })
  @IsEnum(['FULL_DAY', 'HALF_DAY', 'LOP'])
  status: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  hours_worked: number;

  @ApiProperty({ description: 'Mandatory reason for manual correction' })
  @IsString()
  reason: string;
}
