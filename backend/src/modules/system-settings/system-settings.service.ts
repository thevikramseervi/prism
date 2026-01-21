import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * SystemSettingsService
 * 
 * Manages configurable system settings (e.g., attendance thresholds)
 */
@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);
  private cache = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {
    this.initializeDefaults();
  }

  /**
   * Initialize default settings
   */
  async initializeDefaults() {
    const defaults = [
      {
        key: 'FULL_DAY_MIN_HOURS',
        value: '8',
        data_type: 'FLOAT',
        description: 'Minimum hours for full-day attendance',
      },
      {
        key: 'HALF_DAY_MIN_HOURS',
        value: '4',
        data_type: 'FLOAT',
        description: 'Minimum hours for half-day attendance',
      },
      {
        key: 'ANNUAL_CASUAL_LEAVE_UNITS',
        value: '12',
        data_type: 'FLOAT',
        description: 'Annual casual leave units per lab member',
      },
    ];

    for (const setting of defaults) {
      const existing = await this.prisma.systemSetting.findFirst({
        where: {
          key: setting.key,
          effective_to: null,
        },
      });

      if (!existing) {
        await this.prisma.systemSetting.create({
          data: setting,
        });
        this.logger.log(`Default setting created: ${setting.key}`);
      }
    }

    // Load into cache
    await this.refreshCache();
  }

  /**
   * Refresh cache from database
   */
  async refreshCache() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { effective_to: null },
    });

    this.cache.clear();
    settings.forEach((s) => {
      this.cache.set(s.key, s.value);
    });

    this.logger.log('Settings cache refreshed');
  }

  /**
   * Get setting value (from cache)
   */
  async getSetting(key: string): Promise<string | null> {
    if (!this.cache.has(key)) {
      await this.refreshCache();
    }

    return this.cache.get(key) || null;
  }

  /**
   * Get all settings
   */
  async getAllSettings() {
    return this.prisma.systemSetting.findMany({
      where: { effective_to: null },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Update setting (creates new version)
   */
  async updateSetting(key: string, value: string) {
    // Expire current setting
    await this.prisma.systemSetting.updateMany({
      where: {
        key: key,
        effective_to: null,
      },
      data: {
        effective_to: new Date(),
      },
    });

    // Get data type from previous version
    const previous = await this.prisma.systemSetting.findFirst({
      where: { key: key },
      orderBy: { created_at: 'desc' },
    });

    // Create new version
    const updated = await this.prisma.systemSetting.create({
      data: {
        key: key,
        value: value,
        data_type: previous?.data_type || 'STRING',
        description: previous?.description || null,
      },
    });

    // Refresh cache
    await this.refreshCache();

    this.logger.log(`Setting updated: ${key} = ${value}`);

    return updated;
  }
}
