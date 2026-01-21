import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLabMemberDto } from './dto/create-lab-member.dto';
import { UpdateLabMemberDto } from './dto/update-lab-member.dto';

/**
 * LabMembersService
 * 
 * Manages lab member records and their payment band assignments.
 */
@Injectable()
export class LabMembersService {
  private readonly logger = new Logger(LabMembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new lab member
   */
  async create(createLabMemberDto: CreateLabMemberDto) {
    // Verify user exists and is not already a lab member
    const user = await this.prisma.user.findUnique({
      where: { id: createLabMemberDto.user_id },
      include: { lab_member: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.lab_member) {
      throw new ConflictException('User is already a lab member');
    }

    // Check for unique constraints
    const existingBiometric = await this.prisma.labMember.findUnique({
      where: { biometric_user_id: createLabMemberDto.biometric_user_id },
    });

    if (existingBiometric) {
      throw new ConflictException('Biometric user ID already exists');
    }

    const existingEnrollment = await this.prisma.labMember.findUnique({
      where: { enrollment_number: createLabMemberDto.enrollment_number },
    });

    if (existingEnrollment) {
      throw new ConflictException('Enrollment number already exists');
    }

    // Create lab member with initial casual leave balance
    const currentYear = new Date().getFullYear();
    const labMember = await this.prisma.labMember.create({
      data: {
        user_id: createLabMemberDto.user_id,
        biometric_user_id: createLabMemberDto.biometric_user_id,
        enrollment_number: createLabMemberDto.enrollment_number,
        department: createLabMemberDto.department,
        year_of_study: createLabMemberDto.year_of_study,
        joining_date: new Date(createLabMemberDto.joining_date),
        casual_leave_balance: 12.0, // Default annual balance
        leave_balance_year: currentYear,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    this.logger.log(`Lab member created: ${labMember.enrollment_number}`);

    return labMember;
  }

  /**
   * Find all active lab members
   */
  async findAll() {
    return this.prisma.labMember.findMany({
      where: { is_active: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        payment_bands: {
          where: {
            assigned_to: null, // Current assignment
          },
          include: {
            payment_band: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Find lab member by ID
   */
  async findById(id: string) {
    const labMember = await this.prisma.labMember.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        payment_bands: {
          include: {
            payment_band: true,
          },
          orderBy: { assigned_from: 'desc' },
        },
      },
    });

    if (!labMember) {
      throw new NotFoundException('Lab member not found');
    }

    return labMember;
  }

  /**
   * Find lab member by biometric user ID
   */
  async findByBiometricUserId(biometricUserId: string) {
    const labMember = await this.prisma.labMember.findUnique({
      where: { biometric_user_id: biometricUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (!labMember) {
      throw new NotFoundException('Lab member not found for biometric ID');
    }

    return labMember;
  }

  /**
   * Update lab member
   */
  async update(id: string, updateLabMemberDto: UpdateLabMemberDto) {
    await this.findById(id);

    const updated = await this.prisma.labMember.update({
      where: { id },
      data: {
        ...(updateLabMemberDto.department && { department: updateLabMemberDto.department }),
        ...(updateLabMemberDto.year_of_study && { year_of_study: updateLabMemberDto.year_of_study }),
        ...(updateLabMemberDto.exit_date && { exit_date: new Date(updateLabMemberDto.exit_date) }),
        ...(updateLabMemberDto.is_active !== undefined && { is_active: updateLabMemberDto.is_active }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    this.logger.log(`Lab member updated: ${updated.enrollment_number}`);

    return updated;
  }

  /**
   * Assign payment band to lab member
   */
  async assignPaymentBand(labMemberId: string, paymentBandId: string, assignedFrom: Date) {
    await this.findById(labMemberId);

    const paymentBand = await this.prisma.paymentBand.findUnique({
      where: { id: paymentBandId },
    });

    if (!paymentBand) {
      throw new NotFoundException('Payment band not found');
    }

    // Close previous assignment if exists
    await this.prisma.labMemberPaymentBand.updateMany({
      where: {
        lab_member_id: labMemberId,
        assigned_to: null,
      },
      data: {
        assigned_to: assignedFrom,
      },
    });

    // Create new assignment
    const assignment = await this.prisma.labMemberPaymentBand.create({
      data: {
        lab_member_id: labMemberId,
        payment_band_id: paymentBandId,
        assigned_from: assignedFrom,
      },
      include: {
        payment_band: true,
      },
    });

    this.logger.log(`Payment band assigned: ${paymentBand.name} to lab member ${labMemberId}`);

    return assignment;
  }

  /**
   * Reset annual leave balance (run at start of year)
   */
  async resetAnnualLeaveBalance(labMemberId: string, year: number) {
    const labMember = await this.findById(labMemberId);

    if (labMember.leave_balance_year >= year) {
      throw new ConflictException('Leave balance already reset for this year');
    }

    const updated = await this.prisma.labMember.update({
      where: { id: labMemberId },
      data: {
        casual_leave_balance: 12.0,
        leave_balance_year: year,
      },
    });

    this.logger.log(`Leave balance reset for lab member ${labMemberId} for year ${year}`);

    return updated;
  }

  /**
   * Deduct leave balance
   */
  async deductLeaveBalance(labMemberId: string, units: number) {
    const labMember = await this.findById(labMemberId);

    if (labMember.casual_leave_balance < units) {
      throw new ConflictException('Insufficient leave balance');
    }

    const updated = await this.prisma.labMember.update({
      where: { id: labMemberId },
      data: {
        casual_leave_balance: {
          decrement: units,
        },
      },
    });

    this.logger.log(`Leave balance deducted: ${units} units from lab member ${labMemberId}`);

    return updated;
  }

  /**
   * Restore leave balance (when leave is rejected/cancelled)
   */
  async restoreLeaveBalance(labMemberId: string, units: number) {
    await this.findById(labMemberId);

    const updated = await this.prisma.labMember.update({
      where: { id: labMemberId },
      data: {
        casual_leave_balance: {
          increment: units,
        },
      },
    });

    this.logger.log(`Leave balance restored: ${units} units to lab member ${labMemberId}`);

    return updated;
  }
}
