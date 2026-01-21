import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BiometricService } from './biometric.service';
import { IngestBiometricLogDto } from './dto/ingest-biometric-log.dto';
import { BulkIngestBiometricLogsDto } from './dto/bulk-ingest-biometric-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Biometric')
@Controller('biometric')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  @Post('ingest')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Ingest single biometric log from device' })
  @ApiResponse({ status: 201, description: 'Biometric log ingested successfully' })
  async ingestLog(
    @Body() ingestDto: IngestBiometricLogDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.biometricService.ingestLog(ingestDto, userId);
  }

  @Post('ingest/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Bulk ingest biometric logs (batch processing)' })
  @ApiResponse({ status: 201, description: 'Bulk ingest completed' })
  async bulkIngestLogs(
    @Body() bulkIngestDto: BulkIngestBiometricLogsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.biometricService.bulkIngestLogs(bulkIngestDto.logs, userId);
  }

  @Get('recent')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Get recent biometric logs for monitoring' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent logs retrieved successfully' })
  async getRecentLogs(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.biometricService.getRecentLogs(limit);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Get biometric log statistics' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.biometricService.getStatistics(new Date(startDate), new Date(endDate));
  }
}
