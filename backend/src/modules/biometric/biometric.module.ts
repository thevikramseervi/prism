import { Module } from '@nestjs/common';
import { BiometricService } from './biometric.service';
import { BiometricController } from './biometric.controller';
import { LabMembersModule } from '../lab-members/lab-members.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [LabMembersModule, AuditModule],
  controllers: [BiometricController],
  providers: [BiometricService],
  exports: [BiometricService],
})
export class BiometricModule {}
