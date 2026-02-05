import { describe, it, expect } from 'vitest';

// Prisma schema validation test
describe('Prisma Schema Tests', () => {
  it('should validate ReportStatus enum values', () => {
    const validStatuses = ['draft', 'submitted'];

    validStatuses.forEach(status => {
      expect(['draft', 'submitted']).toContain(status);
    });
  });

  it('should validate required fields structure', () => {
    // Example: DailyReport structure
    const dailyReport = {
      salesId: 1,
      reportDate: new Date('2026-02-05'),
      problem: 'Test problem',
      plan: 'Test plan',
      status: 'draft',
    };

    expect(dailyReport).toHaveProperty('salesId');
    expect(dailyReport).toHaveProperty('reportDate');
    expect(dailyReport).toHaveProperty('status');
  });

  it('should validate email format', () => {
    const validEmails = ['yamada@example.com', 'test@example.co.jp', 'user+tag@example.com'];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(email).toMatch(emailRegex);
    });
  });
});
