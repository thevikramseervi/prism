import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';

/**
 * AttendanceExceptionService
 * 
 * Manages attendance exceptions and their resolution
 */
@Injectable()
export class AttendanceExceptionService {
  private readonly logger = new Logger(AttendanceExceptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get all pending exceptions
   */
  async getPendingExceptions() {
    return this.prisma.attendanceException.findMany({
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
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get exceptions for a specific lab member
   */
  async getExceptionsForMember(labMemberId: string) {
    return this.prisma.attendanceException.findMany({
      where: { lab_member_id: labMemberId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get pending exceptions count for a month
   */
  async getPendingExceptionsCountForMonth(labMemberId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendanceException.count({
      where: {
        lab_member_id: labMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PENDING',
      },
    });
  }

  /**
   * Resolve an exception
   */
  async resolveException(exceptionId: string, resolutionNote: string, adminUserId: string) {
    const exception = await this.prisma.attendanceException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    if (exception.status === 'RESOLVED') {
      throw new BadRequestException('Exception already resolved');
    }

    // Check if attendance is frozen
    const attendanceRecord = await this.prisma.attendanceRecord.findUnique({
      where: { id: exception.attendance_record_id },
    });

    if (attendanceRecord?.is_frozen) {
      throw new BadRequestException('Cannot resolve exception for frozen attendance');
    }

    const before = exception;

    // Update exception
    const updated = await this.prisma.attendanceException.update({
      where: { id: exceptionId },
      data: {
        status: 'RESOLVED',
        resolution_note: resolutionNote,
        resolved_at: new Date(),
        resolved_by_id: adminUserId,
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'RESOLVED',
      entity_type: 'AttendanceException',
      entity_id: updated.id,
      before_value: before as unknown as Prisma.JsonObject,
      after_value: updated as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Exception resolved: ${exceptionId} by ${adminUserId}`);

    return updated;
  }
}
