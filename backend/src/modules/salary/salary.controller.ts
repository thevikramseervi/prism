import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { SalaryService } from './salary.service';
import { SalaryCalculationEngine } from './salary-calculation.engine';
import { SalarySlipGenerator } from './salary-slip.generator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Salary')
@Controller('salary')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SalaryController {
  constructor(
    private readonly salaryService: SalaryService,
    private readonly calculationEngine: SalaryCalculationEngine,
    private readonly slipGenerator: SalarySlipGenerator,
  ) {}

  @Post('calculate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Calculate salary for a lab member for a specific month' })
  async calculateSalary(
    @Body('lab_member_id') labMemberId: string,
    @Body('year') year: number,
    @Body('month') month: number,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.salaryService.calculateAndSaveSalary(labMemberId, year, month, adminUserId);
  }

  @Post('calculate/all')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Calculate salary for all lab members for a month' })
  async calculateAllSalaries(
    @Body('year') year: number,
    @Body('month') month: number,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.calculationEngine.calculateSalaryForAll(year, month, adminUserId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get all salary calculations for a lab member' })
  async getAllCalculations(@Param('memberId') memberId: string) {
    return this.salaryService.getAllCalculationsForMember(memberId);
  }

  @Get('member/:memberId/month')
  @ApiOperation({ summary: 'Get salary calculation for a specific month' })
  @ApiQuery({ name: 'year', type: Number })
  @ApiQuery({ name: 'month', type: Number })
  async getCalculation(
    @Param('memberId') memberId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.salaryService.getSalaryCalculation(memberId, year, month);
  }

  @Post('adjustment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Add salary adjustment (bonus/deduction)' })
  async addAdjustment(
    @Body('salary_calculation_id') salaryCalculationId: string,
    @Body('adjustment_type') adjustmentType: 'BONUS' | 'DEDUCTION' | 'CORRECTION',
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.salaryService.addAdjustment(
      salaryCalculationId,
      adjustmentType,
      amount,
      reason,
      adminUserId,
    );
  }

  @Get('slip/:calculationId/pdf')
  @ApiOperation({ summary: 'Generate PDF salary slip' })
  async generatePDFSlip(@Param('calculationId') calculationId: string, @Res() res: Response) {
    const filePath = await this.slipGenerator.generatePDF(calculationId);
    return res.download(filePath);
  }

  @Get('slip/:calculationId/xlsx')
  @ApiOperation({ summary: 'Generate XLSX salary slip' })
  async generateXLSXSlip(@Param('calculationId') calculationId: string, @Res() res: Response) {
    const filePath = await this.slipGenerator.generateXLSX(calculationId);
    return res.download(filePath);
  }

  @Get('slip/:calculationId/csv')
  @ApiOperation({ summary: 'Generate CSV salary slip' })
  async generateCSVSlip(@Param('calculationId') calculationId: string, @Res() res: Response) {
    const filePath = await this.slipGenerator.generateCSV(calculationId);
    return res.download(filePath);
  }
}
