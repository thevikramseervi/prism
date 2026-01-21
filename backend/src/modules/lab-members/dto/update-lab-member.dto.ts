import { PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateLabMemberDto } from './create-lab-member.dto';

export class UpdateLabMemberDto extends PartialType(
  OmitType(CreateLabMemberDto, [
    'user_id',
    'biometric_user_id',
    'enrollment_number',
    'joining_date',
  ] as const),
) {
  @ApiProperty({
    example: '2025-12-31',
    description: 'Exit date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  exit_date?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the lab member is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
