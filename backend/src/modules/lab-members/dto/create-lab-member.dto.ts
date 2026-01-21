import {
  IsString,
  IsInt,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabMemberDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'User ID to associate with lab member',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: 'BIO12345',
    description: 'Biometric device user identifier',
  })
  @IsString()
  biometric_user_id: string;

  @ApiProperty({
    example: 'ENROLL2024001',
    description: 'Enrollment number',
  })
  @IsString()
  enrollment_number: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Department',
  })
  @IsString()
  department: string;

  @ApiProperty({
    example: 3,
    description: 'Year of study (1-4)',
  })
  @IsInt()
  @Min(1)
  @Max(4)
  year_of_study: number;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Joining date',
  })
  @IsDateString()
  joining_date: string;
}
