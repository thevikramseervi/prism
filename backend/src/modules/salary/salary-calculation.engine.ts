import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { AttendanceStatus } from '@prisma/client';

/**
 * SalaryCalculationEngine
 * 
 * CRITICAL RULES:
 * 1. Salary can ONLY be calculated after attendance freeze
 * 2. Calculation is IMMUTABLE after creation
 * 3. Transparent breakdown must be stored
 * 4. Based strictly on frozen attendance records
 */
@Injectable()
export class SalaryCalculationEngine {
  private readonly logger = new Logger(SalaryCalculationEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  /**
   * Calculate salary for a lab member for a specific month
   */
  async calculateSalary(
    labMemberId: string,
    year: number,
    month: number,
  ): Promise<{
    gross_salary: number;
    total_days_worked: number;
    total_hours_worked: number;
    breakdown: any;
  }> {
    // Check if attendance is frozen
    const isFrozen = await this.attendanceService.isMonthFrozen(labMemberId, year, month);

    if (!isFrozen) {
      throw new BadRequestException(
        'Cannot calculate salary: attendance not frozen for this month',
      );
    }

    // Get frozen attendance records
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        lab_member_id: labMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        is_frozen: true,
      },
    });

    // Get current payment band
    const paymentBandAssignment = await this.prisma.labMemberPaymentBand.findFirst({
      where: {
        lab_member_id: labMemberId,
        assigned_to: null, // Current assignment
      },
      include: {
        payment_band: true,
      },
    });

    if (!paymentBandAssignment) {
      throw new BadRequestException('No payment band assigned to this lab member');
    }

    const paymentBand = paymentBandAssignment.payment_band;

    // Calculate total paid days
    const paidDaysMap = {
      [AttendanceStatus.FULL_DAY]: 1.0,
      [AttendanceStatus.HALF_DAY]: 0.5,
      [AttendanceStatus.LOP]: 0.0,
      [AttendanceStatus.CASUAL_LEAVE_FULL]: 1.0,
      [AttendanceStatus.CASUAL_LEAVE_HALF]: 0.5,
      [AttendanceStatus.HOLIDAY]: 1.0,
      [AttendanceStatus.PENDING_EXCEPTION]: 0.0, // Should not exist if frozen
    };

    let totalDaysWorked = 0;
    let totalHoursWorked = 0;

    const dailyBreakdown = attendanceRecords.map((record) => {
      const paidDays = paidDaysMap[record.status] || 0;
      totalDaysWorked += paidDays;
      totalHoursWorked += record.hours_worked || 0;

      return {
        date: record.date.toISOString().split('T')[0],
        status: record.status,
        hours_worked: record.hours_worked,
        paid_days: paidDays,
      };
    });

    // Calculate gross salary
    let grossSalary = 0;

    if (paymentBand.monthly_base_salary) {
      // Monthly salary calculation
      const daysInMonth = new Date(year, month, 0).getDate();
      const perDayRate = paymentBand.monthly_base_salary / daysInMonth;
      grossSalary = perDayRate * totalDaysWorked;
    } else if (paymentBand.hourly_rate) {
      // Hourly salary calculation
      grossSalary = paymentBand.hourly_rate * totalHoursWorked;
    } else {
      throw new BadRequestException('Payment band has neither monthly nor hourly rate configured');
    }

    // Round to 2 decimal places
    grossSalary = Math.round(grossSalary * 100) / 100;

    const breakdown = {
      year,
      month,
      payment_band: {
        name: paymentBand.name,
        monthly_base_salary: paymentBand.monthly_base_salary,
        hourly_rate: paymentBand.hourly_rate,
      },
      attendance_summary: {
        total_calendar_days: new Date(year, month, 0).getDate(),
        total_days_worked: totalDaysWorked,
        total_hours_worked: totalHoursWorked,
        full_days: dailyBreakdown.filter((d) => d.paid_days === 1.0).length,
        half_days: dailyBreakdown.filter((d) => d.paid_days === 0.5).length,
        lop_days: dailyBreakdown.filter((d) => d.paid_days === 0.0).length,
      },
      calculation_method: paymentBand.monthly_base_salary
        ? 'monthly_pro_rata'
        : 'hourly_rate',
      daily_breakdown: dailyBreakdown,
      gross_salary: grossSalary,
      calculated_at: new Date().toISOString(),
    };

    return {
      gross_salary: grossSalary,
      total_days_worked: totalDaysWorked,
      total_hours_worked: totalHoursWorked,
      breakdown,
    };
  }

  /**
   * Calculate salary for all active lab members for a month
   */
  async calculateSalaryForAll(year: number, month: number, adminUserId: string) {
    const labMembers = await this.prisma.labMember.findMany({
      where: { is_active: true },
    });

    const results = [];

    for (const member of labMembers) {
      try {
        const calculation = await this.calculateSalary(member.id, year, month);

        // Save calculation
        const saved = await this.prisma.monthlySalaryCalculation.create({
          data: {
            lab_member_id: member.id,
            year: year,
            month: month,
            total_days_worked: calculation.total_days_worked,
            total_hours_worked: calculation.total_hours_worked,
            gross_salary: calculation.gross_salary,
            breakdown: calculation.breakdown as any,
            calculated_by_id: adminUserId,
          },
        });

        results.push({
          lab_member_id: member.id,
          status: 'success',
          calculation: saved,
        });
      } catch (error) {
        this.logger.error(
          `Failed to calculate salary for member ${member.id}: ${error.message}`,
        );
        results.push({
          lab_member_id: member.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;

    this.logger.log(`Salary calculation completed: ${successCount} success, ${failureCount} failures`);

    return {
      total: labMembers.length,
      success: successCount,
      failures: failureCount,
      results,
    };
  }
}
