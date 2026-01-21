import { IsEmail, IsString, MinLength, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@seedlab.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: ['role-id-1', 'role-id-2'],
    description: 'Array of role IDs to assign to the user',
  })
  @IsArray()
  @ArrayNotEmpty()
  role_ids: string[];
}
