import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LabMembersModule } from './modules/lab-members/lab-members.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { HolidayModule } from './modules/holiday/holiday.module';
import { SalaryModule } from './modules/salary/salary.module';
import { AuditModule } from './modules/audit/audit.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core modules
    PrismaModule,
    AuditModule,
    SystemSettingsModule,

    // Feature modules
    AuthModule,
    UsersModule,
    LabMembersModule,
    BiometricModule,
    AttendanceModule,
    LeaveModule,
    HolidayModule,
    SalaryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
