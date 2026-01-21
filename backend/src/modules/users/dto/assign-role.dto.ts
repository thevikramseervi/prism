import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: 'role-uuid-here',
    description: 'Role ID to assign',
  })
  @IsString()
  @IsUUID()
  role_id: string;
}
