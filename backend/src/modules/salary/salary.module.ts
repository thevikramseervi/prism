import { Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { SalaryCalculationEngine } from './salary-calculation.engine';
import { SalarySlipGenerator } from './salary-slip.generator';
import { AttendanceModule } from '../attendance/attendance.module';
import { LabMembersModule } from '../lab-members/lab-members.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AttendanceModule, LabMembersModule, AuditModule],
  controllers: [SalaryController],
  providers: [SalaryService, SalaryCalculationEngine, SalarySlipGenerator],
  exports: [SalaryService, SalaryCalculationEngine],
})
export class SalaryModule {}
