import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';

/**
 * HolidayService
 * 
 * Manages holiday calendar (institute and lab-specific holidays)
 */
@Injectable()
export class HolidayService {
  private readonly logger = new Logger(HolidayService.name);
  private holidayCache = new Map<string, boolean>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create holiday
   */
  async create(createHolidayDto: CreateHolidayDto) {
    const holiday = await this.prisma.holiday.create({
      data: {
        name: createHolidayDto.name,
        date: new Date(createHolidayDto.date),
        holiday_type: createHolidayDto.holiday_type as any,
        description: createHolidayDto.description,
      },
    });

    // Invalidate cache
    this.holidayCache.clear();

    this.logger.log(`Holiday created: ${holiday.name} on ${holiday.date.toISOString().split('T')[0]}`);

    return holiday;
  }

  /**
   * Get all holidays
   */
  async findAll(year?: number) {
    const where: any = {};

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Check if a date is a holiday
   */
  async isHoliday(date: Date): Promise<boolean> {
    const dateKey = date.toISOString().split('T')[0];

    if (this.holidayCache.has(dateKey)) {
      return this.holidayCache.get(dateKey)!;
    }

    const holiday = await this.prisma.holiday.findFirst({
      where: { date: date },
    });

    const isHol = holiday !== null;
    this.holidayCache.set(dateKey, isHol);

    return isHol;
  }

  /**
   * Delete holiday
   */
  async remove(id: string) {
    await this.prisma.holiday.delete({
      where: { id },
    });

    this.holidayCache.clear();

    this.logger.log(`Holiday deleted: ${id}`);

    return { message: 'Holiday deleted successfully' };
  }
}
