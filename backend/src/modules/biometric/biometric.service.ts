import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { IngestBiometricLogDto } from './dto/ingest-biometric-log.dto';
import { Prisma } from '@prisma/client';

/**
 * BiometricService
 * 
 * CRITICAL RULES:
 * 1. Biometric logs are APPEND-ONLY - NEVER update or delete
 * 2. All ingestion is audited
 * 3. Device time is NOT trusted - server time is authoritative
 * 4. Duplicate/delayed logs are allowed and preserved
 */
@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ingest biometric log from device
   * APPEND-ONLY: Creates new record, never updates existing
   */
  async ingestLog(ingestDto: IngestBiometricLogDto, actorUserId?: string) {
    // Validate event type
    const validEventTypes = ['IN', 'OUT', 'UNKNOWN'];
    if (!validEventTypes.includes(ingestDto.event_type)) {
      throw new BadRequestException(
        `Invalid event type. Must be one of: ${validEventTypes.join(', ')}`,
      );
    }

    // Create biometric log
    const biometricLog = await this.prisma.biometricLog.create({
      data: {
        device_id: ingestDto.device_id,
        biometric_user_id: ingestDto.biometric_user_id,
        timestamp: new Date(ingestDto.timestamp),
        event_type: ingestDto.event_type,
        raw_data: ingestDto.raw_data || {},
      },
    });

    // Audit log
    await this.auditService.log({
      actor_user_id: actorUserId || null,
      actor_type: actorUserId ? 'USER' : 'SYSTEM',
      action_type: 'CREATED',
      entity_type: 'BiometricLog',
      entity_id: biometricLog.id,
      after_value: biometricLog as unknown as Prisma.JsonObject,
    });

    this.logger.log(
      `Biometric log ingested: ${ingestDto.biometric_user_id} - ${ingestDto.event_type} at ${ingestDto.timestamp}`,
    );

    return biometricLog;
  }

  /**
   * Bulk ingest biometric logs (batch processing)
   */
  async bulkIngestLogs(ingestDtos: IngestBiometricLogDto[], actorUserId?: string) {
    const results = [];

    for (const dto of ingestDtos) {
      try {
        const log = await this.ingestLog(dto, actorUserId);
        results.push({ success: true, log });
      } catch (error) {
        this.logger.error(`Failed to ingest log: ${error.message}`, error.stack);
        results.push({ success: false, error: error.message, dto });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    this.logger.log(`Bulk ingest completed: ${successCount} success, ${failureCount} failures`);

    return {
      total: ingestDtos.length,
      success: successCount,
      failures: failureCount,
      results,
    };
  }

  /**
   * Get biometric logs for a specific user and date range
   * Used by attendance derivation engine
   */
  async getLogsForUserAndDateRange(
    biometricUserId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.biometricLog.findMany({
      where: {
        biometric_user_id: biometricUserId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Get biometric logs for a specific date
   */
  async getLogsForDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.biometricLog.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [{ biometric_user_id: 'asc' }, { timestamp: 'asc' }],
    });
  }

  /**
   * Get biometric logs for a specific user on a specific date
   */
  async getLogsForUserOnDate(biometricUserId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.biometricLog.findMany({
      where: {
        biometric_user_id: biometricUserId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Get recent biometric logs (for monitoring)
   */
  async getRecentLogs(limit: number = 100) {
    return this.prisma.biometricLog.findMany({
      take: limit,
      orderBy: { server_received_at: 'desc' },
    });
  }

  /**
   * Get biometric log statistics
   */
  async getStatistics(startDate: Date, endDate: Date) {
    const logs = await this.prisma.biometricLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const uniqueDevices = new Set(logs.map((log) => log.device_id)).size;
    const uniqueUsers = new Set(logs.map((log) => log.biometric_user_id)).size;

    const eventTypeCounts = logs.reduce(
      (acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total_logs: logs.length,
      unique_devices: uniqueDevices,
      unique_users: uniqueUsers,
      event_type_breakdown: eventTypeCounts,
      date_range: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * CRITICAL: This method is INTENTIONALLY NOT IMPLEMENTED
   * Biometric logs are APPEND-ONLY and must NEVER be updated or deleted
   */
  private async updateLog() {
    throw new Error('FORBIDDEN: Biometric logs cannot be updated');
  }

  /**
   * CRITICAL: This method is INTENTIONALLY NOT IMPLEMENTED
   * Biometric logs are APPEND-ONLY and must NEVER be updated or deleted
   */
  private async deleteLog() {
    throw new Error('FORBIDDEN: Biometric logs cannot be deleted');
  }
}
