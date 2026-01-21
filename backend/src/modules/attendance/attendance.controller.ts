import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceDerivationEngine } from './attendance-derivation.engine';
import { AttendanceExceptionService } from './attendance-exception.service';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { FreezeAttendanceDto } from './dto/freeze-attendance.dto';
import { ResolveExceptionDto } from './dto/resolve-exception.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly derivationEngine: AttendanceDerivationEngine,
    private readonly exceptionService: AttendanceExceptionService,
  ) {}

  // ===== Attendance Records =====

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get attendance records for a lab member' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getAttendance(
    @Param('memberId') memberId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.attendanceService.getAttendanceForMember(memberId, start, end);
  }

  @Get('member/:memberId/statistics')
  @ApiOperation({ summary: 'Get attendance statistics for a lab member' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  async getStatistics(
    @Param('memberId') memberId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.attendanceService.getAttendanceStatistics(memberId, year, month);
  }

  @Post('manual')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Manual attendance correction (admin only)' })
  async manualCorrection(
    @Body() manualDto: ManualAttendanceDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.attendanceService.manualAttendanceCorrection(
      manualDto.lab_member_id,
      new Date(manualDto.date),
      manualDto,
      adminUserId,
    );
  }

  // ===== Attendance Derivation =====

  @Post('derive/date')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Derive attendance for all members for a specific date' })
  async deriveForDate(@Body('date') date: string) {
    return this.derivationEngine.deriveAttendanceForDate(new Date(date));
  }

  @Post('derive/range')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Re-derive attendance for a date range' })
  async deriveForRange(@Body('startDate') startDate: string, @Body('endDate') endDate: string) {
    return this.derivationEngine.rederiveAttendanceForDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ===== Freeze Mechanism =====

  @Post('freeze')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Freeze attendance for a lab member for a month' })
  async freezeAttendance(
    @Body() freezeDto: FreezeAttendanceDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.attendanceService.freezeAttendance(
      freezeDto.lab_member_id,
      freezeDto.year,
      freezeDto.month,
      adminUserId,
    );
  }

  @Post('freeze/all')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Freeze attendance for all lab members for a month' })
  async freezeAllAttendance(
    @Body() freezeDto: { year: number; month: number },
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.attendanceService.freezeAttendanceForAll(
      freezeDto.year,
      freezeDto.month,
      adminUserId,
    );
  }

  // ===== Exception Management =====

  @Get('exceptions/pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Get all pending attendance exceptions' })
  async getPendingExceptions() {
    return this.exceptionService.getPendingExceptions();
  }

  @Get('exceptions/member/:memberId')
  @ApiOperation({ summary: 'Get exceptions for a specific lab member' })
  async getExceptionsForMember(@Param('memberId') memberId: string) {
    return this.exceptionService.getExceptionsForMember(memberId);
  }

  @Post('exceptions/:exceptionId/resolve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Resolve an attendance exception' })
  async resolveException(
    @Param('exceptionId') exceptionId: string,
    @Body() resolveDto: ResolveExceptionDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.exceptionService.resolveException(
      exceptionId,
      resolveDto.resolution_note,
      adminUserId,
    );
  }
}
