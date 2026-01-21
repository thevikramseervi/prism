import { Module } from '@nestjs/common';
import { LabMembersService } from './lab-members.service';
import { LabMembersController } from './lab-members.controller';

@Module({
  controllers: [LabMembersController],
  providers: [LabMembersService],
  exports: [LabMembersService],
})
export class LabMembersModule {}
