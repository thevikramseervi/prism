import { Controller, Get } from '@nestjs/common';

/**
 * AppController
 * 
 * Root controller providing API information and navigation
 */
@Controller()
export class AppController {
  /**
   * Root endpoint - provides API overview and navigation
   */
  @Get()
  getWelcome() {
    return {
      name: 'Attend Ease - Automated Invoice Billing Calculator',
      version: '1.0.0',
      description: 'Production-grade attendance and salary management system for Samsung SEED Lab',
      environment: process.env.NODE_ENV || 'development',
      documentation: {
        swagger: '/api/docs',
        readme: 'See backend/README.md for setup instructions',
      },
      endpoints: {
        auth: {
          base: '/auth',
          operations: ['login', 'refresh', 'logout'],
        },
        users: {
          base: '/users',
          operations: ['create', 'list', 'get', 'update', 'delete', 'assign-role'],
        },
        labMembers: {
          base: '/lab-members',
          operations: ['create', 'list', 'get', 'update', 'assign-payment-band'],
        },
        biometric: {
          base: '/biometric',
          operations: ['ingest', 'bulk-ingest', 'recent', 'statistics'],
        },
        attendance: {
          base: '/attendance',
          operations: ['view', 'derive', 'freeze', 'exceptions', 'manual-correction'],
        },
        leave: {
          base: '/leave',
          operations: ['request', 'approve', 'reject', 'balance'],
        },
        salary: {
          base: '/salary',
          operations: ['calculate', 'view', 'adjustments', 'slips (pdf/xlsx/csv)'],
        },
        holidays: {
          base: '/holidays',
          operations: ['create', 'list', 'delete'],
        },
        systemSettings: {
          base: '/system-settings',
          operations: ['get', 'update'],
        },
      },
      defaultCredentials: {
        email: 'admin@seedlab.com',
        password: 'admin123',
        warning: '⚠️  Change this password in production!',
      },
      status: 'operational',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
