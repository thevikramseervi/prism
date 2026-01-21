import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AttendanceStatus, AttendanceSource, Prisma } from '@prisma/client';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';

/**
 * AttendanceService
 * 
 * Manages attendance records, freeze mechanism, and manual corrections
 */
@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get attendance records for a lab member
   */
  async getAttendanceForMember(labMemberId: string, startDate?: Date, endDate?: Date) {
    const where: any = { lab_member_id: labMemberId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get attendance record for a specific date
   */
  async getAttendanceForMemberOnDate(labMemberId: string, date: Date) {
    return this.prisma.attendanceRecord.findUnique({
      where: {
        lab_member_id_date: {
          lab_member_id: labMemberId,
          date: date,
        },
      },
    });
  }

  /**
   * Get attendance statistics for a lab member
   */
  async getAttendanceStatistics(labMemberId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        lab_member_id: labMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = {
      total_days: records.length,
      full_days: records.filter((r) => r.status === AttendanceStatus.FULL_DAY).length,
      half_days: records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length,
      lop_days: records.filter((r) => r.status === AttendanceStatus.LOP).length,
      casual_leave_full: records.filter((r) => r.status === AttendanceStatus.CASUAL_LEAVE_FULL)
        .length,
      casual_leave_half: records.filter((r) => r.status === AttendanceStatus.CASUAL_LEAVE_HALF)
        .length,
      holidays: records.filter((r) => r.status === AttendanceStatus.HOLIDAY).length,
      pending_exceptions: records.filter((r) => r.status === AttendanceStatus.PENDING_EXCEPTION)
        .length,
      total_paid_days:
        records
          .filter(
            (r) =>
              r.status === AttendanceStatus.FULL_DAY ||
              r.status === AttendanceStatus.CASUAL_LEAVE_FULL ||
              r.status === AttendanceStatus.HOLIDAY,
          )
          .length +
        records.filter(
          (r) =>
            r.status === AttendanceStatus.HALF_DAY ||
            r.status === AttendanceStatus.CASUAL_LEAVE_HALF,
        ).length *
          0.5,
      total_hours_worked: records.reduce((sum, r) => sum + (r.hours_worked || 0), 0),
    };

    return stats;
  }

  /**
   * Manual attendance correction (admin only)
   * CRITICAL: Requires mandatory reason and is fully audited
   */
  async manualAttendanceCorrection(
    labMemberId: string,
    date: Date,
    manualDto: ManualAttendanceDto,
    adminUserId: string,
  ) {
    // Check if attendance is frozen
    const existingRecord = await this.getAttendanceForMemberOnDate(labMemberId, date);

    if (existingRecord?.is_frozen) {
      throw new BadRequestException('Cannot modify frozen attendance');
    }

    const before = existingRecord;

    // Create or update attendance record
    const attendanceRecord = await this.prisma.attendanceRecord.upsert({
      where: {
        lab_member_id_date: {
          lab_member_id: labMemberId,
          date: date,
        },
      },
      create: {
        lab_member_id: labMemberId,
        date: date,
        status: manualDto.status as AttendanceStatus,
        source: AttendanceSource.MANUAL,
        hours_worked: manualDto.hours_worked,
        manual_reason: manualDto.reason,
      },
      update: {
        status: manualDto.status as AttendanceStatus,
        source: AttendanceSource.MANUAL,
        hours_worked: manualDto.hours_worked,
        manual_reason: manualDto.reason,
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: before ? 'UPDATED' : 'CREATED',
      entity_type: 'AttendanceRecord',
      entity_id: attendanceRecord.id,
      before_value: before as unknown as Prisma.JsonObject,
      after_value: attendanceRecord as unknown as Prisma.JsonObject,
    });

    this.logger.log(
      `Manual attendance correction: ${labMemberId} on ${date.toISOString().split('T')[0]} by ${adminUserId}`,
    );

    return attendanceRecord;
  }

  /**
   * Check if month is frozen for a lab member
   */
  async isMonthFrozen(labMemberId: string, year: number, month: number): Promise<boolean> {
    const freeze = await this.prisma.attendanceFreeze.findUnique({
      where: {
        lab_member_id_year_month: {
          lab_member_id: labMemberId,
          year: year,
          month: month,
        },
      },
    });

    return freeze !== null;
  }

  /**
   * Freeze attendance for a month
   * CRITICAL: After freeze, attendance becomes immutable
   */
  async freezeAttendance(
    labMemberId: string,
    year: number,
    month: number,
    adminUserId: string,
  ) {
    // Check for pending exceptions
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const pendingExceptions = await this.prisma.attendanceException.count({
      where: {
        lab_member_id: labMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PENDING',
      },
    });

    if (pendingExceptions > 0) {
      throw new BadRequestException(
        `Cannot freeze attendance: ${pendingExceptions} pending exception(s) must be resolved first`,
      );
    }

    // Check if already frozen
    const existing = await this.prisma.attendanceFreeze.findUnique({
      where: {
        lab_member_id_year_month: {
          lab_member_id: labMemberId,
          year: year,
          month: month,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance already frozen for this month');
    }

    // Create freeze record
    const freeze = await this.prisma.attendanceFreeze.create({
      data: {
        lab_member_id: labMemberId,
        year: year,
        month: month,
        frozen_by_id: adminUserId,
      },
    });

    // Mark all attendance records as frozen
    await this.prisma.attendanceRecord.updateMany({
      where: {
        lab_member_id: labMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        is_frozen: true,
        frozen_at: new Date(),
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'FROZEN',
      entity_type: 'AttendanceFreeze',
      entity_id: freeze.id,
      after_value: freeze as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Attendance frozen: ${labMemberId} for ${year}-${month} by ${adminUserId}`);

    return freeze;
  }

  /**
   * Freeze attendance for all active lab members for a month
   */
  async freezeAttendanceForAll(year: number, month: number, adminUserId: string) {
    const labMembers = await this.prisma.labMember.findMany({
      where: { is_active: true },
    });

    const results = [];

    for (const member of labMembers) {
      try {
        const freeze = await this.freezeAttendance(member.id, year, month, adminUserId);
        results.push({ lab_member_id: member.id, status: 'success', freeze });
      } catch (error) {
        this.logger.error(
          `Failed to freeze attendance for member ${member.id}: ${error.message}`,
        );
        results.push({ lab_member_id: member.id, status: 'error', error: error.message });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;

    this.logger.log(
      `Bulk freeze completed: ${successCount} success, ${failureCount} failures`,
    );

    return {
      total: labMembers.length,
      success: successCount,
      failures: failureCount,
      results,
    };
  }
}
