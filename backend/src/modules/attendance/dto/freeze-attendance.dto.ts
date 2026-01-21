import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FreezeAttendanceDto {
  @ApiProperty()
  @IsUUID()
  lab_member_id: string;

  @ApiProperty()
  @IsInt()
  @Min(2020)
  year: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
