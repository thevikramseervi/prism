import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * AuditService
 * 
 * CRITICAL: All significant actions must be audited
 * Audit logs are APPEND-ONLY and NEVER deleted
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create audit log entry
   */
  async log(params: {
    actor_user_id: string | null;
    actor_type: 'USER' | 'SYSTEM';
    action_type: string;
    entity_type: string;
    entity_id: string;
    before_value?: Prisma.JsonObject | null;
    after_value?: Prisma.JsonObject | null;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          actor_user_id: params.actor_user_id,
          actor_type: params.actor_type,
          action_type: params.action_type,
          entity_type: params.entity_type,
          entity_id: params.entity_id,
          before_value: params.before_value ?? Prisma.JsonNull,
          after_value: params.after_value ?? Prisma.JsonNull,
          ip_address: params.ip_address || null,
          user_agent: params.user_agent || null,
        },
      });

      this.logger.debug(
        `Audit log created: ${params.action_type} on ${params.entity_type}:${params.entity_id}`,
      );

      return auditLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error.stack);
      // Don't throw - audit logging failure should not break operations
      return null;
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getLogsForEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      include: {
        actor_user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get recent audit logs
   */
  async getRecentLogs(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      include: {
        actor_user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get audit logs for a specific user (actor)
   */
  async getLogsForUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { actor_user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
