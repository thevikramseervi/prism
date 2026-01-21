import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SalaryCalculationEngine } from './salary-calculation.engine';
import { Prisma } from '@prisma/client';

/**
 * SalaryService
 * 
 * Manages salary calculations, adjustments, and retrieval
 */
@Injectable()
export class SalaryService {
  private readonly logger = new Logger(SalaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly calculationEngine: SalaryCalculationEngine,
  ) {}

  /**
   * Get salary calculation for a lab member for a specific month
   */
  async getSalaryCalculation(labMemberId: string, year: number, month: number) {
    const calculation = await this.prisma.monthlySalaryCalculation.findUnique({
      where: {
        lab_member_id_year_month: {
          lab_member_id: labMemberId,
          year: year,
          month: month,
        },
      },
      include: {
        salary_adjustments: true,
      },
    });

    if (!calculation) {
      throw new NotFoundException('Salary calculation not found');
    }

    // Calculate net salary (gross + adjustments)
    const adjustments = calculation.salary_adjustments.reduce(
      (sum, adj) => sum + adj.amount,
      0,
    );

    return {
      ...calculation,
      adjustments_total: adjustments,
      net_salary: calculation.gross_salary + adjustments,
    };
  }

  /**
   * Calculate and save salary for a lab member
   */
  async calculateAndSaveSalary(labMemberId: string, year: number, month: number, adminUserId: string) {
    // Check if already calculated
    const existing = await this.prisma.monthlySalaryCalculation.findUnique({
      where: {
        lab_member_id_year_month: {
          lab_member_id: labMemberId,
          year: year,
          month: month,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Salary already calculated for this month');
    }

    // Calculate
    const calculation = await this.calculationEngine.calculateSalary(labMemberId, year, month);

    // Save
    const saved = await this.prisma.monthlySalaryCalculation.create({
      data: {
        lab_member_id: labMemberId,
        year: year,
        month: month,
        total_days_worked: calculation.total_days_worked,
        total_hours_worked: calculation.total_hours_worked,
        gross_salary: calculation.gross_salary,
        breakdown: calculation.breakdown as any,
        calculated_by_id: adminUserId,
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'CALCULATED',
      entity_type: 'MonthlySalaryCalculation',
      entity_id: saved.id,
      after_value: saved as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Salary calculated: ${labMemberId} for ${year}-${month}`);

    return saved;
  }

  /**
   * Add salary adjustment (bonus/deduction)
   */
  async addAdjustment(
    salaryCalculationId: string,
    adjustmentType: 'BONUS' | 'DEDUCTION' | 'CORRECTION',
    amount: number,
    reason: string,
    adminUserId: string,
  ) {
    const calculation = await this.prisma.monthlySalaryCalculation.findUnique({
      where: { id: salaryCalculationId },
    });

    if (!calculation) {
      throw new NotFoundException('Salary calculation not found');
    }

    const adjustment = await this.prisma.salaryAdjustment.create({
      data: {
        salary_calculation_id: salaryCalculationId,
        lab_member_id: calculation.lab_member_id,
        adjustment_type: adjustmentType,
        amount: amount,
        reason: reason,
        created_by_id: adminUserId,
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: adminUserId,
      actor_type: 'USER',
      action_type: 'CREATED',
      entity_type: 'SalaryAdjustment',
      entity_id: adjustment.id,
      after_value: adjustment as unknown as Prisma.JsonObject,
    });

    this.logger.log(`Salary adjustment added: ${adjustmentType} of ${amount} for calculation ${salaryCalculationId}`);

    return adjustment;
  }

  /**
   * Get all salary calculations for a lab member
   */
  async getAllCalculationsForMember(labMemberId: string) {
    const calculations = await this.prisma.monthlySalaryCalculation.findMany({
      where: { lab_member_id: labMemberId },
      include: {
        salary_adjustments: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return calculations.map((calc) => {
      const adjustments = calc.salary_adjustments.reduce((sum, adj) => sum + adj.amount, 0);
      return {
        ...calc,
        adjustments_total: adjustments,
        net_salary: calc.gross_salary + adjustments,
      };
    });
  }
}
