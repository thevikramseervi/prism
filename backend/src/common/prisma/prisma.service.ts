import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService
 * 
 * Manages the Prisma Client lifecycle and database connection.
 * This service is the single point of access to the database.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        this.$on('query' as never, (e: any) => {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        });
      }

      this.$on('error' as never, (e: any) => {
        this.logger.error(`Database error: ${e.message}`);
      });

      this.$on('warn' as never, (e: any) => {
        this.logger.warn(`Database warning: ${e.message}`);
      });
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Clean database (ONLY FOR TESTING - DO NOT USE IN PRODUCTION)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Order matters due to foreign key constraints
    const models = [
      'auditLog',
      'salarySlip',
      'salaryAdjustment',
      'monthlySalaryCalculation',
      'attendanceFreeze',
      'holiday',
      'leaveRequest',
      'attendanceException',
      'attendanceRecord',
      'biometricLog',
      'labMemberPaymentBand',
      'labMember',
      'paymentBand',
      'userRole',
      'role',
      'user',
      'systemSetting',
    ];

    for (const model of models) {
      await (this as any)[model].deleteMany({});
    }

    this.logger.warn('Database cleaned (test environment only)');
  }
}
