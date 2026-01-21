import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LabMembersModule } from '../lab-members/lab-members.module';
import { HolidayModule } from '../holiday/holiday.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [LabMembersModule, HolidayModule, AuditModule],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
