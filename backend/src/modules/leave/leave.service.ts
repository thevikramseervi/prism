import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LabMembersService } from '../lab-members/lab-members.service';
import { HolidayService } from '../holiday/holiday.service';
import { AuditService } from '../audit/audit.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { Prisma } from '@prisma/client';

/**
 * LeaveService
 * 
 * Manages casual leave requests, approval workflow, and balance tracking
 * 
 * RULES:
 * 1. Cannot apply leave on holidays
 * 2. Cannot approve leave after attendance freeze
 * 3. Approved leave overrides biometric data
 * 4. Leave balance is validated before approval
 */
@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly labMembersService: LabMembersService,
    private readonly holidayService: HolidayService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create leave request
   */
  async createLeaveRequest(createDto: CreateLeaveRequestDto, labMemberId: string) {
    const startDate = new Date(createDto.start_date);
    const endDate = new Date(createDto.end_date);

    // Validate dates
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Check if dates fall on holidays
    const isStartHoliday = await this.holidayService.isHoliday(startDate);
    const isEndHoliday = await this.holidayService.isHoliday(endDate);

    if (isStartHoliday || isEndHoliday) {
      throw new BadRequestException('Cannot apply leave on holidays');
    }

    // Calculate units
    const units = createDto.duration === 'FULL_DAY' ? 1.0 : 0.5;

    // Get lab member
    const labMember = await this.labMembersService.findById(labMemberId);

    // Check balance
    if (labMember.casual_leave_balance < units) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${labMember.casual_leave_balance}, Required: ${units}`,
      );
    }

    // Create leave request
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        lab_member_id: labMemberId,
        leave_type: createDto.leave_type as any,
        start_date: startDate,
        end_date: endDate,
        duration: createDto.duration as any,
        half_day_period: createDto.half_day_period as any,
        reason: createDto.reason,
        units_consumed: units,
      },
    });

    this.logger.log(`Leave request created: ${leaveRequest.id} for lab member ${labMemberId}`);

    return leaveRequest;
  }

  /**
   * Get leave requests for a lab member
   */
  async getLeaveRequestsForMember(labMemberId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { lab_member_id: labMemberId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get all pending leave requests (for admin)
   */
  async getPendingRequests() {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        lab_member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Approve leave request
   */
  async approveLeaveRequest(requestId: string, adminUserId: string) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new BadRequestException('Leave request already processed');
    }

    // Check if attendance is frozen for this period
    const year = leaveRequest.start_date.getFullYear();
    const month = leaveRequest.start_date.getMonth() + 1;

    const freeze = await this.prisma.attendanceFreeze.findUnique({
      where: {
        lab_member_id_year_month: {
          lab_member_id: leaveRequest.lab_member_id,
          year: year,
          month: month,
        },
      },
    });

    if (freeze) {
      throw new BadRequestException('Cannot approve leave: attendance already frozen for this month');
    }

    // Deduct leave balance
    await this.labMembersService.deductLeaveBalance(
      leaveRequest.lab_member_id,
      leaveRequest.units_consumed!,
    );

    const before = leaveRequest;

    // Update leave request
    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approved_by_id: adminUserId,
        approved_at: new Date(),
      },
    });

    // Update attendance record (override biometric)
    const attendanceStatus =
      leaveRequest.duration === 'FULL_DAY' ? 'CASUAL_LEAVE_FULL' : 'CASUAL_LEAVE_HALF';

    await this.prisma.attendanceRecord.upsert({
      where: {
        lab_member_id_date: {
          lab_member_id: leaveRequest.lab_member_id,
          date: leaveRequest.start_date,
        },
      },
      create: {
        lab_member_id: leaveRequest.lab_member_id,
        date: leaveRequest.start_date,
        status: attendanceStatus as any,
        source: 'LEAVE_OVERRIDE',
      },
      update: {
        status: attendanceStatus as any,
        source: 'LEAVE_OVERRIDE',
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'APPROVED',
      entity_type: 'LeaveRequest',
      entity_id: updated.id,
      before_value: before as unknown as Prisma.JsonObject,
      after_value: updated as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Leave request approved: ${requestId} by ${adminUserId}`);

    return updated;
  }

  /**
   * Reject leave request
   */
  async rejectLeaveRequest(requestId: string, rejectionReason: string, adminUserId: string) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new BadRequestException('Leave request already processed');
    }

    const before = leaveRequest;

    // Update leave request
    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejection_reason: rejectionReason,
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'REJECTED',
      entity_type: 'LeaveRequest',
      entity_id: updated.id,
      before_value: before as unknown as Prisma.JsonObject,
      after_value: updated as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Leave request rejected: ${requestId} by ${adminUserId}`);

    return updated;
  }

  /**
   * Get leave balance for a lab member
   */
  async getLeaveBalance(labMemberId: string) {
    const labMember = await this.labMembersService.findById(labMemberId);

    const currentYear = new Date().getFullYear();

    // Check if balance needs reset
    if (labMember.leave_balance_year < currentYear) {
      const resetMember = await this.labMembersService.resetAnnualLeaveBalance(
        labMemberId,
        currentYear,
      );

      return {
        available: resetMember.casual_leave_balance,
        year: resetMember.leave_balance_year,
        reset: true,
      };
    }

    return {
      available: labMember.casual_leave_balance,
      year: labMember.leave_balance_year,
      reset: false,
    };
  }
}
