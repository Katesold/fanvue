import { validateDecision } from './decisionsController';

describe('validateDecision', () => {
  describe('valid decisions', () => {
    it('should accept "approved" decision without reason', () => {
      const result = validateDecision('approved');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept "approved" decision with optional reason', () => {
      const result = validateDecision('approved', 'Low risk creator');
      expect(result.valid).toBe(true);
    });

    it('should accept "held" decision without reason', () => {
      const result = validateDecision('held');
      expect(result.valid).toBe(true);
    });

    it('should accept "held" decision with optional reason', () => {
      const result = validateDecision('held', 'Pending verification');
      expect(result.valid).toBe(true);
    });

    it('should accept "rejected" decision with reason', () => {
      const result = validateDecision('rejected', 'Fraud detected');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid decisions', () => {
    it('should reject invalid decision type', () => {
      const result = validateDecision('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid decision');
    });

    it('should reject empty decision type', () => {
      const result = validateDecision('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid decision');
    });

    it('should reject "rejected" decision without reason', () => {
      const result = validateDecision('rejected');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reason is required');
    });

    it('should reject "rejected" decision with empty reason', () => {
      const result = validateDecision('rejected', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reason is required');
    });

    it('should reject "rejected" decision with whitespace-only reason', () => {
      const result = validateDecision('rejected', '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reason is required');
    });
  });
});
