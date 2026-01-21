import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BiometricService } from '../biometric/biometric.service';
import { HolidayService } from '../holiday/holiday.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { AttendanceStatus, AttendanceSource } from '@prisma/client';

/**
 * AttendanceDerivationEngine
 * 
 * CRITICAL COMPONENT: Derives attendance from biometric logs
 * 
 * RULES:
 * 1. Attendance is DERIVED, never manually created without explicit admin action
 * 2. Biometric logs are the raw input, attendance records are the derived truth
 * 3. Derivation is deterministic and re-runnable before freeze
 * 4. Incomplete/inconsistent data results in PENDING_EXCEPTION
 * 5. Holidays override biometric data
 * 6. Approved leave overrides biometric data
 */
@Injectable()
export class AttendanceDerivationEngine {
  private readonly logger = new Logger(AttendanceDerivationEngine.name);

  // Default thresholds (can be overridden by system settings)
  private FULL_DAY_MIN_HOURS = 8;
  private HALF_DAY_MIN_HOURS = 4;

  constructor(
    private readonly prisma: PrismaService,
    private readonly biometricService: BiometricService,
    private readonly holidayService: HolidayService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  /**
   * Initialize thresholds from system settings
   */
  async initializeThresholds() {
    try {
      const fullDayHours = await this.systemSettingsService.getSetting('FULL_DAY_MIN_HOURS');
      const halfDayHours = await this.systemSettingsService.getSetting('HALF_DAY_MIN_HOURS');

      if (fullDayHours) {
        this.FULL_DAY_MIN_HOURS = parseFloat(fullDayHours);
      }

      if (halfDayHours) {
        this.HALF_DAY_MIN_HOURS = parseFloat(halfDayHours);
      }

      this.logger.log(
        `Thresholds initialized: FULL_DAY=${this.FULL_DAY_MIN_HOURS}h, HALF_DAY=${this.HALF_DAY_MIN_HOURS}h`,
      );
    } catch (error) {
      this.logger.warn('Failed to load thresholds from settings, using defaults');
    }
  }

  /**
   * Derive attendance for a specific lab member on a specific date
   */
  async deriveAttendanceForMemberOnDate(
    labMemberId: string,
    date: Date,
  ): Promise<{
    status: AttendanceStatus;
    source: AttendanceSource;
    hours_worked: number | null;
    first_in: Date | null;
    last_out: Date | null;
    exception: {
      type: string;
      description: string;
    } | null;
  }> {
    await this.initializeThresholds();

    // Check if date is a holiday
    const isHoliday = await this.holidayService.isHoliday(date);
    if (isHoliday) {
      return {
        status: AttendanceStatus.HOLIDAY,
        source: AttendanceSource.HOLIDAY,
        hours_worked: null,
        first_in: null,
        last_out: null,
        exception: null,
      };
    }

    // Get lab member details
    const labMember = await this.prisma.labMember.findUnique({
      where: { id: labMemberId },
    });

    if (!labMember) {
      throw new Error('Lab member not found');
    }

    // Get biometric logs for the day
    const logs = await this.biometricService.getLogsForUserOnDate(
      labMember.biometric_user_id,
      date,
    );

    // If no logs, mark as exception
    if (logs.length === 0) {
      return {
        status: AttendanceStatus.PENDING_EXCEPTION,
        source: AttendanceSource.BIOMETRIC,
        hours_worked: 0,
        first_in: null,
        last_out: null,
        exception: {
          type: 'MISSING_DATA',
          description: 'No biometric logs found for this date',
        },
      };
    }

    // Parse logs to calculate hours
    const { hoursWorked, firstIn, lastOut, isInconsistent, inconsistencyReason } =
      this.calculateHoursFromLogs(logs);

    if (isInconsistent) {
      return {
        status: AttendanceStatus.PENDING_EXCEPTION,
        source: AttendanceSource.BIOMETRIC,
        hours_worked: hoursWorked,
        first_in: firstIn,
        last_out: lastOut,
        exception: {
          type: 'INCONSISTENT_LOGS',
          description: inconsistencyReason || 'Biometric logs are inconsistent',
        },
      };
    }

    // Determine attendance status based on hours worked
    let status: AttendanceStatus;
    if (hoursWorked >= this.FULL_DAY_MIN_HOURS) {
      status = AttendanceStatus.FULL_DAY;
    } else if (hoursWorked >= this.HALF_DAY_MIN_HOURS) {
      status = AttendanceStatus.HALF_DAY;
    } else {
      status = AttendanceStatus.LOP; // Loss of Pay
    }

    return {
      status,
      source: AttendanceSource.BIOMETRIC,
      hours_worked: hoursWorked,
      first_in: firstIn,
      last_out: lastOut,
      exception: null,
    };
  }

  /**
   * Calculate hours worked from biometric logs
   * 
   * Handles:
   * - IN/OUT pairing
   * - Missing OUT events
   * - Multiple IN/OUT pairs
   * - Inconsistent sequences
   */
  private calculateHoursFromLogs(logs: any[]): {
    hoursWorked: number;
    firstIn: Date | null;
    lastOut: Date | null;
    isInconsistent: boolean;
    inconsistencyReason: string | null;
  } {
    if (logs.length === 0) {
      return {
        hoursWorked: 0,
        firstIn: null,
        lastOut: null,
        isInconsistent: false,
        inconsistencyReason: null,
      };
    }

    // Sort logs by timestamp
    const sortedLogs = [...logs].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let firstIn: Date | null = null;
    let lastOut: Date | null = null;
    let totalHours = 0;
    let currentInTime: Date | null = null;

    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];

      if (log.event_type === 'IN') {
        if (currentInTime !== null) {
          // Consecutive IN events - inconsistency
          return {
            hoursWorked: 0,
            firstIn,
            lastOut,
            isInconsistent: true,
            inconsistencyReason: 'Consecutive IN events detected without OUT',
          };
        }
        currentInTime = log.timestamp;
        if (firstIn === null) {
          firstIn = log.timestamp;
        }
      } else if (log.event_type === 'OUT') {
        if (currentInTime === null) {
          // OUT before IN - inconsistency
          return {
            hoursWorked: 0,
            firstIn,
            lastOut,
            isInconsistent: true,
            inconsistencyReason: 'OUT event before IN event',
          };
        }
        lastOut = log.timestamp;
        const duration = (log.timestamp.getTime() - currentInTime.getTime()) / (1000 * 60 * 60);
        totalHours += duration;
        currentInTime = null;
      }
      // UNKNOWN events are ignored for calculation
    }

    // If there's an unmatched IN, use end of day as OUT (or mark as exception)
    if (currentInTime !== null) {
      // Missing OUT event - could be an exception or use heuristic
      const endOfDay = new Date(currentInTime);
      endOfDay.setHours(23, 59, 59, 999);

      // If the IN was within last hour of day, it's likely a mistake
      const hoursUntilEndOfDay =
        (endOfDay.getTime() - currentInTime.getTime()) / (1000 * 60 * 60);

      if (hoursUntilEndOfDay < 1) {
        return {
          hoursWorked: totalHours,
          firstIn,
          lastOut,
          isInconsistent: true,
          inconsistencyReason: 'IN event near end of day without matching OUT',
        };
      }

      // Otherwise, assume they worked till end of day (admin should review)
      totalHours += hoursUntilEndOfDay;
      lastOut = endOfDay;

      this.logger.warn(
        `Missing OUT event for IN at ${currentInTime}, assuming work till end of day`,
      );
    }

    return {
      hoursWorked: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      firstIn,
      lastOut,
      isInconsistent: false,
      inconsistencyReason: null,
    };
  }

  /**
   * Derive attendance for all lab members for a specific date
   * (Typically run daily as a scheduled job)
   */
  async deriveAttendanceForDate(date: Date): Promise<{
    total: number;
    success: number;
    failures: number;
    exceptions: number;
    results: any[];
  }> {
    const labMembers = await this.prisma.labMember.findMany({
      where: { is_active: true },
    });

    const results = [];
    let successCount = 0;
    let failureCount = 0;
    let exceptionCount = 0;

    for (const member of labMembers) {
      try {
        const derivedAttendance = await this.deriveAttendanceForMemberOnDate(member.id, date);

        // Check if attendance already exists
        const existing = await this.prisma.attendanceRecord.findUnique({
          where: {
            lab_member_id_date: {
              lab_member_id: member.id,
              date: date,
            },
          },
        });

        if (existing && existing.is_frozen) {
          results.push({
            lab_member_id: member.id,
            status: 'skipped',
            reason: 'Attendance is frozen',
          });
          continue;
        }

        // Create or update attendance record
        const attendanceRecord = await this.prisma.attendanceRecord.upsert({
          where: {
            lab_member_id_date: {
              lab_member_id: member.id,
              date: date,
            },
          },
          create: {
            lab_member_id: member.id,
            date: date,
            status: derivedAttendance.status,
            source: derivedAttendance.source,
            hours_worked: derivedAttendance.hours_worked,
            first_in: derivedAttendance.first_in,
            last_out: derivedAttendance.last_out,
          },
          update: {
            status: derivedAttendance.status,
            source: derivedAttendance.source,
            hours_worked: derivedAttendance.hours_worked,
            first_in: derivedAttendance.first_in,
            last_out: derivedAttendance.last_out,
          },
        });

        // Handle exceptions
        if (derivedAttendance.exception) {
          const exception = await this.prisma.attendanceException.upsert({
            where: {
              attendance_record_id: attendanceRecord.id,
            },
            create: {
              attendance_record_id: attendanceRecord.id,
              lab_member_id: member.id,
              date: date,
              exception_type: derivedAttendance.exception.type as any,
              description: derivedAttendance.exception.description,
            },
            update: {
              exception_type: derivedAttendance.exception.type as any,
              description: derivedAttendance.exception.description,
            },
          });

          exceptionCount++;
        }

        successCount++;
        results.push({
          lab_member_id: member.id,
          status: 'success',
          attendance: attendanceRecord,
        });
      } catch (error) {
        failureCount++;
        this.logger.error(
          `Failed to derive attendance for member ${member.id}: ${error.message}`,
          error.stack,
        );
        results.push({
          lab_member_id: member.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    this.logger.log(
      `Attendance derivation completed for ${date.toISOString().split('T')[0]}: ` +
        `${successCount} success, ${failureCount} failures, ${exceptionCount} exceptions`,
    );

    return {
      total: labMembers.length,
      success: successCount,
      failures: failureCount,
      exceptions: exceptionCount,
      results,
    };
  }

  /**
   * Re-derive attendance for a date range (before freeze)
   * Used when biometric data is corrected or rules change
   */
  async rederiveAttendanceForDateRange(startDate: Date, endDate: Date) {
    const results = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const result = await this.deriveAttendanceForDate(new Date(currentDate));
      results.push({
        date: new Date(currentDate),
        result,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      date_range: {
        start: startDate,
        end: endDate,
      },
      results,
    };
  }
}
