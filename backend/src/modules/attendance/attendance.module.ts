import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceDerivationEngine } from './attendance-derivation.engine';
import { AttendanceExceptionService } from './attendance-exception.service';
import { BiometricModule } from '../biometric/biometric.module';
import { LabMembersModule } from '../lab-members/lab-members.module';
import { HolidayModule } from '../holiday/holiday.module';
import { AuditModule } from '../audit/audit.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';

@Module({
  imports: [
    BiometricModule,
    LabMembersModule,
    HolidayModule,
    AuditModule,
    SystemSettingsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceDerivationEngine, AttendanceExceptionService],
  exports: [AttendanceService, AttendanceDerivationEngine],
})
export class AttendanceModule {}
