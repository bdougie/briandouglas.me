import { describe, it, expect } from 'vitest';
import { formatDateShort, formatDateLong } from './dateFormatting';

describe('Date Formatting', () => {
  describe('formatDateShort', () => {
    it('should format valid date correctly', () => {
      expect(formatDateShort('2015-05-11')).toBe('May 11, 2015');
      expect(formatDateShort('2024-01-01')).toBe('Jan 1, 2024');
      expect(formatDateShort('2024-12-31')).toBe('Dec 31, 2024');
    });

    it('should handle single digit months and days', () => {
      expect(formatDateShort('2024-01-05')).toBe('Jan 5, 2024');
      expect(formatDateShort('2024-03-09')).toBe('Mar 9, 2024');
    });

    it('should handle leap year dates', () => {
      expect(formatDateShort('2024-02-29')).toBe('Feb 29, 2024');
    });

    it('should return Invalid Date for invalid formats', () => {
      expect(formatDateShort('invalid')).toBe('Invalid Date');
      expect(formatDateShort('05/11/2015')).toBe('Invalid Date');
      expect(formatDateShort('2015/05/11')).toBe('Invalid Date');
      expect(formatDateShort('')).toBe('Invalid Date');
    });

    it('should return Invalid Date for invalid dates', () => {
      expect(formatDateShort('2024-13-01')).toBe('Invalid Date');
      expect(formatDateShort('2024-00-01')).toBe('Invalid Date');
      expect(formatDateShort('2024-01-32')).toBe('Invalid Date');
      expect(formatDateShort('2024-01-00')).toBe('Invalid Date');
    });

    it('should handle edge cases', () => {
      expect(formatDateShort('2024-02-30')).toBe('Invalid Date');
      expect(formatDateShort('2023-02-29')).toBe('Invalid Date');
    });
  });

  describe('formatDateLong', () => {
    it('should format valid date correctly', () => {
      expect(formatDateLong('2015-05-11')).toBe('May 11, 2015');
      expect(formatDateLong('2024-01-01')).toBe('January 1, 2024');
      expect(formatDateLong('2024-12-31')).toBe('December 31, 2024');
    });

    it('should handle single digit months and days', () => {
      expect(formatDateLong('2024-01-05')).toBe('January 5, 2024');
      expect(formatDateLong('2024-03-09')).toBe('March 9, 2024');
    });

    it('should handle leap year dates', () => {
      expect(formatDateLong('2024-02-29')).toBe('February 29, 2024');
    });

    it('should return Invalid Date for invalid formats', () => {
      expect(formatDateLong('invalid')).toBe('Invalid Date');
      expect(formatDateLong('05/11/2015')).toBe('Invalid Date');
      expect(formatDateLong('2015/05/11')).toBe('Invalid Date');
      expect(formatDateLong('')).toBe('Invalid Date');
    });

    it('should return Invalid Date for invalid dates', () => {
      expect(formatDateLong('2024-13-01')).toBe('Invalid Date');
      expect(formatDateLong('2024-00-01')).toBe('Invalid Date');
      expect(formatDateLong('2024-01-32')).toBe('Invalid Date');
      expect(formatDateLong('2024-01-00')).toBe('Invalid Date');
    });

    it('should handle edge cases', () => {
      expect(formatDateLong('2024-02-30')).toBe('Invalid Date');
      expect(formatDateLong('2023-02-29')).toBe('Invalid Date');
    });
  });

  describe('Date validation edge cases', () => {
    it('should reject non-standard date formats', () => {
      expect(formatDateShort('2015-5-11')).toBe('Invalid Date');
      
      expect(formatDateShort('05/11/2015')).toBe('Invalid Date');
      
      expect(formatDateShort('May 11, 2015')).toBe('Invalid Date');
    });
    
    it('should handle ISO date strings', () => {
      const date1 = new Date('2015-05-11T00:00:00.000Z');
      const expectedDay1 = date1.getDate();
      const expectedYear1 = date1.getFullYear();
      const expectedMonth1 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date1.getMonth()];
      expect(formatDateShort('2015-05-11T00:00:00.000Z')).toBe(`${expectedMonth1} ${expectedDay1}, ${expectedYear1}`);
      
      const date2 = new Date('2024-01-01T00:00:00Z');
      const expectedDay2 = date2.getDate();
      const expectedYear2 = date2.getFullYear();
      const expectedMonth2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date2.getMonth()];
      expect(formatDateShort('2024-01-01T00:00:00Z')).toBe(`${expectedMonth2} ${expectedDay2}, ${expectedYear2}`);
      
      const date3 = new Date('2024-12-31T23:59:59Z');
      const expectedDay3 = date3.getDate();
      const expectedYear3 = date3.getFullYear();
      const expectedMonth3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date3.getMonth()];
      expect(formatDateShort('2024-12-31T23:59:59Z')).toBe(`${expectedMonth3} ${expectedDay3}, ${expectedYear3}`);
    });
    
    it('should handle Date objects', () => {
      expect(formatDateShort(new Date(2015, 4, 11))).toBe('May 11, 2015');
      expect(formatDateShort(new Date(2024, 0, 1))).toBe('Jan 1, 2024');
      expect(formatDateShort(new Date(2024, 11, 31))).toBe('Dec 31, 2024');
    });
    
    it('should accept YYYY-MM-DD format', () => {
      expect(formatDateShort('2015-05-11')).toBe('May 11, 2015');
      expect(formatDateShort('2024-01-01')).toBe('Jan 1, 2024');
      expect(formatDateShort('2024-12-31')).toBe('Dec 31, 2024');
    });
  });
});