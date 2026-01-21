import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SalarySlipGenerator
 * 
 * Generates salary slips in PDF, XLSX, and CSV formats
 */
@Injectable()
export class SalarySlipGenerator {
  private readonly logger = new Logger(SalarySlipGenerator.name);
  private readonly STORAGE_DIR = process.env.SALARY_SLIP_DIR || './storage/salary-slips';

  constructor(private readonly prisma: PrismaService) {
    // Ensure storage directory exists
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Generate PDF salary slip
   */
  async generatePDF(salaryCalculationId: string): Promise<string> {
    const calculation = await this.getCalculationWithDetails(salaryCalculationId);

    const fileName = `salary_slip_${calculation.lab_member.enrollment_number}_${calculation.year}_${calculation.month}.pdf`;
    const filePath = path.join(this.STORAGE_DIR, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Salary Slip', { align: 'center' });
      doc.moveDown();

      // Lab Member Details
      doc.fontSize(12).text(`Name: ${calculation.lab_member.user.full_name}`);
      doc.text(`Enrollment Number: ${calculation.lab_member.enrollment_number}`);
      doc.text(`Department: ${calculation.lab_member.department}`);
      doc.text(`Period: ${calculation.month}/${calculation.year}`);
      doc.moveDown();

      // Attendance Summary
      doc.fontSize(14).text('Attendance Summary', { underline: true });
      doc.fontSize(10);
      const breakdown = calculation.breakdown as any;
      doc.text(`Total Days Worked: ${calculation.total_days_worked}`);
      doc.text(`Total Hours Worked: ${calculation.total_hours_worked || 'N/A'}`);
      doc.moveDown();

      // Salary Details
      doc.fontSize(14).text('Salary Details', { underline: true });
      doc.fontSize(10);
      doc.text(`Gross Salary: ₹${calculation.gross_salary.toFixed(2)}`);

      // Adjustments
      if (calculation.salary_adjustments.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text('Adjustments', { underline: true });
        doc.fontSize(10);
        calculation.salary_adjustments.forEach((adj) => {
          doc.text(
            `${adj.adjustment_type}: ${adj.amount >= 0 ? '+' : ''}₹${adj.amount.toFixed(2)} (${adj.reason})`,
          );
        });
      }

      // Net Salary
      const adjustmentsTotal = calculation.salary_adjustments.reduce(
        (sum, adj) => sum + adj.amount,
        0,
      );
      const netSalary = calculation.gross_salary + adjustmentsTotal;

      doc.moveDown();
      doc.fontSize(16).text(`Net Salary: ₹${netSalary.toFixed(2)}`);

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text(`Generated on: ${new Date().toISOString()}`, { align: 'right' });

      doc.end();
    });
  }

  /**
   * Generate XLSX salary slip
   */
  async generateXLSX(salaryCalculationId: string): Promise<string> {
    const calculation = await this.getCalculationWithDetails(salaryCalculationId);

    const fileName = `salary_slip_${calculation.lab_member.enrollment_number}_${calculation.year}_${calculation.month}.xlsx`;
    const filePath = path.join(this.STORAGE_DIR, fileName);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Slip');

    // Title
    worksheet.addRow(['SALARY SLIP']);
    worksheet.addRow([]);

    // Member Details
    worksheet.addRow(['Name', calculation.lab_member.user.full_name]);
    worksheet.addRow(['Enrollment Number', calculation.lab_member.enrollment_number]);
    worksheet.addRow(['Department', calculation.lab_member.department]);
    worksheet.addRow(['Period', `${calculation.month}/${calculation.year}`]);
    worksheet.addRow([]);

    // Attendance Summary
    worksheet.addRow(['Attendance Summary']);
    worksheet.addRow(['Total Days Worked', calculation.total_days_worked]);
    worksheet.addRow(['Total Hours Worked', calculation.total_hours_worked || 'N/A']);
    worksheet.addRow([]);

    // Salary Details
    worksheet.addRow(['Salary Details']);
    worksheet.addRow(['Gross Salary', calculation.gross_salary]);

    if (calculation.salary_adjustments.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(['Adjustments']);
      calculation.salary_adjustments.forEach((adj) => {
        worksheet.addRow([adj.adjustment_type, adj.amount, adj.reason]);
      });
    }

    const adjustmentsTotal = calculation.salary_adjustments.reduce(
      (sum, adj) => sum + adj.amount,
      0,
    );
    const netSalary = calculation.gross_salary + adjustmentsTotal;

    worksheet.addRow([]);
    worksheet.addRow(['Net Salary', netSalary]);

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Generate CSV salary slip
   */
  async generateCSV(salaryCalculationId: string): Promise<string> {
    const calculation = await this.getCalculationWithDetails(salaryCalculationId);

    const fileName = `salary_slip_${calculation.lab_member.enrollment_number}_${calculation.year}_${calculation.month}.csv`;
    const filePath = path.join(this.STORAGE_DIR, fileName);

    const csvLines = [
      'SALARY SLIP',
      '',
      `Name,${calculation.lab_member.user.full_name}`,
      `Enrollment Number,${calculation.lab_member.enrollment_number}`,
      `Department,${calculation.lab_member.department}`,
      `Period,${calculation.month}/${calculation.year}`,
      '',
      'Attendance Summary',
      `Total Days Worked,${calculation.total_days_worked}`,
      `Total Hours Worked,${calculation.total_hours_worked || 'N/A'}`,
      '',
      'Salary Details',
      `Gross Salary,${calculation.gross_salary}`,
    ];

    if (calculation.salary_adjustments.length > 0) {
      csvLines.push('', 'Adjustments', 'Type,Amount,Reason');
      calculation.salary_adjustments.forEach((adj) => {
        csvLines.push(`${adj.adjustment_type},${adj.amount},${adj.reason}`);
      });
    }

    const adjustmentsTotal = calculation.salary_adjustments.reduce(
      (sum, adj) => sum + adj.amount,
      0,
    );
    const netSalary = calculation.gross_salary + adjustmentsTotal;

    csvLines.push('', `Net Salary,${netSalary}`);

    fs.writeFileSync(filePath, csvLines.join('\n'));

    return filePath;
  }

  /**
   * Helper: Get calculation with all details
   */
  private async getCalculationWithDetails(salaryCalculationId: string) {
    const calculation = await this.prisma.monthlySalaryCalculation.findUnique({
      where: { id: salaryCalculationId },
      include: {
        lab_member: {
          include: {
            user: {
              select: {
                full_name: true,
                email: true,
              },
            },
          },
        },
        salary_adjustments: true,
      },
    });

    if (!calculation) {
      throw new Error('Salary calculation not found');
    }

    return calculation;
  }
}
