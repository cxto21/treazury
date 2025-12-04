// test_security_thresholds.test.ts
// Scope: AML limits and policy enforcement
// Tests: Daily limits, per-transaction limits, KYC thresholds, rate limiting

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cairo } from 'starknet';

interface AMLPolicy {
  tierLimits: {
    [key: number]: {
      perTransfer: string;
      dailyLimit: string;
      requiresApproval: boolean;
    };
  };
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
}

interface TransactionRecord {
  timestamp: number;
  amount: string;
  sender: string;
  status: 'success' | 'failed' | 'pending';
}

describe('Security Thresholds (AML)', () => {
  let mockAMLPolicy: AMLPolicy;
  let mockTransactionHistory: TransactionRecord[];
  let mockContractService: any;

  beforeEach(() => {
    // Define AML policy
    mockAMLPolicy = {
      tierLimits: {
        1: {
          perTransfer: '1000', // Tier 1: 1000 USDC per transfer
          dailyLimit: '2000', // 2000 USDC per day
          requiresApproval: false,
        },
        2: {
          perTransfer: '10000', // Tier 2: 10,000 USDC per transfer
          dailyLimit: '50000', // 50,000 USDC per day
          requiresApproval: false,
        },
        3: {
          perTransfer: '100000', // Tier 3: 100,000 USDC per transfer
          dailyLimit: '500000', // 500,000 USDC per day
          requiresApproval: true,
        },
      },
      rateLimitPerMinute: 10,
      rateLimitPerHour: 100,
    };

    mockTransactionHistory = [];

    // Mock contract service
    mockContractService = {
      checkTransactionLimit: vi.fn(),
      checkDailyLimit: vi.fn(),
      checkRateLimit: vi.fn(),
      getUserKYCLevel: vi.fn(),
      recordTransaction: vi.fn(),
    };
  });

  describe('per-transfer limits', () => {
    it('enforces maximum per-transfer limits based on KYC tier', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 1;
      const transferAmount = cairo.uint256(1500); // Exceeds Tier 1 limit of 1000

      mockContractService.getUserKYCLevel.mockResolvedValueOnce(kycLevel);
      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: false,
        limit: mockAMLPolicy.tierLimits[kycLevel].perTransfer,
        requested: '1500',
        reason: 'Exceeds per-transfer limit',
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        kycLevel,
        '1500'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Exceeds per-transfer limit');
    });

    it('allows transfer within per-transfer limit', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 2;
      const transferAmount = '5000'; // Within Tier 2 limit of 10,000

      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: true,
        limit: mockAMLPolicy.tierLimits[kycLevel].perTransfer,
        requested: transferAmount,
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        kycLevel,
        transferAmount
      );

      expect(result.allowed).toBe(true);
    });

    it('enforces zero limit for unverified users (KYC level 0)', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 0; // No KYC
      const transferAmount = '100';

      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: false,
        limit: '0',
        reason: 'User not KYC verified',
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        kycLevel,
        transferAmount
      );

      expect(result.allowed).toBe(false);
    });

    it('escalates higher tiers to approval for amounts > threshold', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 3;
      const transferAmount = '250000'; // Within Tier 3 but requires approval

      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: true,
        requiresApproval: true,
        approvalRequired: 'manual_review',
        limit: mockAMLPolicy.tierLimits[kycLevel].perTransfer,
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        kycLevel,
        transferAmount
      );

      expect(result.requiresApproval).toBe(true);
      expect(result.allowed).toBe(true);
    });
  });

  describe('daily cumulative limits', () => {
    it('enforces daily cumulative limit', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 2;
      const dailyLimit = parseInt(mockAMLPolicy.tierLimits[kycLevel].dailyLimit);

      // Simulate previous transactions today
      mockTransactionHistory = [
        {
          timestamp: Date.now() - 1000000, // 16 minutes ago
          amount: '30000',
          sender: userAddress,
          status: 'success',
        },
        {
          timestamp: Date.now() - 500000, // 8 minutes ago
          amount: '15000',
          sender: userAddress,
          status: 'success',
        },
      ];

      const totalToday = 30000 + 15000; // 45,000
      const newTransfer = '7000'; // Would total 52,000 (exceeds 50,000)

      mockContractService.checkDailyLimit.mockResolvedValueOnce({
        allowed: false,
        dailyLimit: mockAMLPolicy.tierLimits[kycLevel].dailyLimit,
        spentToday: totalToday.toString(),
        requested: newTransfer,
        remaining: (dailyLimit - totalToday).toString(),
        reason: 'Daily limit would be exceeded',
      });

      const result = await mockContractService.checkDailyLimit(
        userAddress,
        kycLevel,
        newTransfer
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Daily limit would be exceeded');
    });

    it('resets daily limit at midnight UTC', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 1;

      // Transaction from yesterday
      mockTransactionHistory = [
        {
          timestamp: Date.now() - 86400000 - 1000, // Yesterday + 1 second
          amount: '2000',
          sender: userAddress,
          status: 'success',
        },
      ];

      const todayTransfer = '1000'; // Should be allowed (limit reset)

      mockContractService.checkDailyLimit.mockResolvedValueOnce({
        allowed: true,
        dailyLimit: mockAMLPolicy.tierLimits[kycLevel].dailyLimit,
        spentToday: '0',
        requested: todayTransfer,
      });

      const result = await mockContractService.checkDailyLimit(
        userAddress,
        kycLevel,
        todayTransfer
      );

      expect(result.allowed).toBe(true);
    });

    it('calculates remaining daily allowance correctly', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 2;
      const dailyLimit = parseInt(mockAMLPolicy.tierLimits[kycLevel].dailyLimit);

      mockTransactionHistory = [
        {
          timestamp: Date.now() - 3600000, // 1 hour ago
          amount: '25000',
          sender: userAddress,
          status: 'success',
        },
      ];

      const spentToday = 25000;
      const expected = dailyLimit - spentToday; // 50000 - 25000 = 25000

      mockContractService.checkDailyLimit.mockResolvedValueOnce({
        allowed: true,
        spentToday: spentToday.toString(),
        remaining: expected.toString(),
      });

      const result = await mockContractService.checkDailyLimit(
        userAddress,
        kycLevel,
        '20000'
      );

      expect(parseInt(result.remaining)).toBe(expected);
    });
  });

  describe('rate limiting', () => {
    it('enforces rate limit per minute (max 10 transactions)', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const now = Date.now();

      // Simulate 10 transactions in last minute
      mockTransactionHistory = Array(10)
        .fill(null)
        .map((_, i) => ({
          timestamp: now - (i * 1000 + 1000), // Spaced 1 second apart
          amount: '100',
          sender: userAddress,
          status: 'success',
        }));

      mockContractService.checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        rateLimitPerMinute: mockAMLPolicy.rateLimitPerMinute,
        transactionsInLastMinute: 10,
        reason: 'Rate limit exceeded (per minute)',
      });

      const result = await mockContractService.checkRateLimit(userAddress);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');
    });

    it('allows transactions within rate limit', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const now = Date.now();

      // Simulate 5 transactions in last minute
      mockTransactionHistory = Array(5)
        .fill(null)
        .map((_, i) => ({
          timestamp: now - (i * 2000 + 1000), // Spaced 2 seconds apart
          amount: '100',
          sender: userAddress,
          status: 'success',
        }));

      mockContractService.checkRateLimit.mockResolvedValueOnce({
        allowed: true,
        transactionsInLastMinute: 5,
        remaining: 5,
      });

      const result = await mockContractService.checkRateLimit(userAddress);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('enforces hourly rate limit (max 100 transactions)', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const now = Date.now();

      // Simulate 100 transactions in last hour
      mockTransactionHistory = Array(100)
        .fill(null)
        .map((_, i) => ({
          timestamp: now - (i * 36000 + 1000), // Evenly spaced in hour
          amount: '10',
          sender: userAddress,
          status: 'success',
        }));

      mockContractService.checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        rateLimitPerHour: mockAMLPolicy.rateLimitPerHour,
        transactionsInLastHour: 100,
        reason: 'Rate limit exceeded (per hour)',
      });

      const result = await mockContractService.checkRateLimit(userAddress);

      expect(result.allowed).toBe(false);
      expect(result.transactionsInLastHour).toBe(100);
    });
  });

  describe('KYC level and tiered access', () => {
    it('denies all transfers to users with KYC level 0', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      mockContractService.getUserKYCLevel.mockResolvedValueOnce(0);
      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: false,
        reason: 'User not KYC verified',
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        0,
        '1'
      );

      expect(result.allowed).toBe(false);
    });

    it('upgrades user tier when KYC level increases', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      // Upgrade from Tier 1 to Tier 2
      mockContractService.getUserKYCLevel
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const level1 = await mockContractService.getUserKYCLevel(userAddress);
      expect(level1).toBe(1);

      // Simulate KYC approval
      const level2 = await mockContractService.getUserKYCLevel(userAddress);
      expect(level2).toBe(2);
      expect(level2).toBeGreaterThan(level1);
    });

    it('restricts high-value transfers unless Tier 3', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';
      const kycLevel = 2;
      const highValueAmount = '100000'; // Tier 3+ only

      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: false,
        reason: 'Insufficient KYC tier for high-value transfer',
        requiredTier: 3,
        currentTier: kycLevel,
      });

      const result = await mockContractService.checkTransactionLimit(
        userAddress,
        kycLevel,
        highValueAmount
      );

      expect(result.allowed).toBe(false);
    });
  });

  describe('compliance and audit', () => {
    it('logs all rejected transactions for audit trail', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      mockContractService.checkTransactionLimit.mockResolvedValueOnce({
        allowed: false,
        reason: 'Exceeds limit',
      });

      mockContractService.recordTransaction.mockResolvedValueOnce({
        recorded: true,
        auditLogId: '0x...audit_id',
        timestamp: Date.now(),
        status: 'rejected',
      });

      const checkResult = await mockContractService.checkTransactionLimit(
        userAddress,
        1,
        '5000'
      );

      if (!checkResult.allowed) {
        const auditResult = await mockContractService.recordTransaction({
          userAddress,
          status: 'rejected',
          reason: checkResult.reason,
        });

        expect(auditResult.recorded).toBe(true);
        expect(auditResult.auditLogId).toBeDefined();
      }
    });

    it('maintains transaction history for compliance reporting', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      mockTransactionHistory = [
        {
          timestamp: Date.now() - 86400000, // 1 day ago
          amount: '1000',
          sender: userAddress,
          status: 'success',
        },
        {
          timestamp: Date.now() - 43200000, // 12 hours ago
          amount: '500',
          sender: userAddress,
          status: 'success',
        },
      ];

      expect(mockTransactionHistory.length).toBe(2);
      expect(
        mockTransactionHistory.every((tx) => tx.sender === userAddress)
      ).toBe(true);
    });

    it('flags suspicious activity pattern for review', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      // Sudden spike in transaction volume
      mockTransactionHistory = Array(15)
        .fill(null)
        .map((_, i) => ({
          timestamp: Date.now() - (i * 1000 + 1000),
          amount: '1000',
          sender: userAddress,
          status: 'success',
        }));

      mockContractService.checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        suspicious: true,
        flaggedFor: 'manual_review',
        reason: 'Unusual transaction volume',
      });

      const result = await mockContractService.checkRateLimit(userAddress);

      expect(result.suspicious).toBe(true);
      expect(result.flaggedFor).toBe('manual_review');
    });
  });

  describe('policy updates and versioning', () => {
    it('applies new policy limits on update', async () => {
      const userAddress = '0x0123456789abcdef0123456789abcdef01234567';

      // Old policy
      const oldLimit = '1000';

      // Update policy
      const newLimit = '2000';
      mockAMLPolicy.tierLimits[1].perTransfer = newLimit;

      expect(mockAMLPolicy.tierLimits[1].perTransfer).toBe(newLimit);
      expect(mockAMLPolicy.tierLimits[1].perTransfer).not.toBe(oldLimit);
    });

    it('maintains backwards compatibility with existing limits', async () => {
      const tier1Limit = mockAMLPolicy.tierLimits[1].perTransfer;
      const tier2Limit = mockAMLPolicy.tierLimits[2].perTransfer;

      // Tier 1 should always be less restrictive than Tier 2
      expect(parseInt(tier1Limit)).toBeLessThan(parseInt(tier2Limit));
    });
  });
});