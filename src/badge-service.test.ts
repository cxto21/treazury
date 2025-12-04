import { describe, it, expect } from "bun:test";

interface BadgeLevel {
  tier: number;
  name: string;
  requirements: number;
}

describe("Badge Service", () => {
  const badges: Record<number, BadgeLevel> = {
    1: { tier: 1, name: "Bronze", requirements: 100 },
    2: { tier: 2, name: "Silver", requirements: 500 },
    3: { tier: 3, name: "Gold", requirements: 1000 },
  };

  it("should have three badge tiers", () => {
    expect(Object.keys(badges).length).toBe(3);
  });

  it("should assign correct tier names", () => {
    expect(badges[1].name).toBe("Bronze");
    expect(badges[2].name).toBe("Silver");
    expect(badges[3].name).toBe("Gold");
  });

  it("should have increasing requirements", () => {
    expect(badges[1].requirements).toBeLessThan(badges[2].requirements);
    expect(badges[2].requirements).toBeLessThan(badges[3].requirements);
  });

  it("should verify badge tier validity", () => {
    const isValidTier = (tier: number): boolean => tier >= 1 && tier <= 3;
    expect(isValidTier(1)).toBe(true);
    expect(isValidTier(2)).toBe(true);
    expect(isValidTier(3)).toBe(true);
    expect(isValidTier(0)).toBe(false);
    expect(isValidTier(4)).toBe(false);
  });

  it("should track badge counts", () => {
    const counts = { bronze: 0, silver: 0, gold: 0 };
    counts.bronze++;
    counts.silver++;
    counts.gold++;

    expect(counts.bronze).toBe(1);
    expect(counts.silver).toBe(1);
    expect(counts.gold).toBe(1);
  });
});

describe("Commitment Validation", () => {
  it("should have unique commitments", () => {
    const usedCommitments = new Set<string>();
    const commitment1 = "0xabc123";
    const commitment2 = "0xdef456";

    usedCommitments.add(commitment1);
    usedCommitments.add(commitment2);

    expect(usedCommitments.has(commitment1)).toBe(true);
    expect(usedCommitments.has(commitment2)).toBe(true);
    expect(usedCommitments.size).toBe(2);
  });

  it("should prevent commitment reuse", () => {
    const usedCommitments = new Set<string>();
    const commitment = "0xabc123";

    const canUse = !usedCommitments.has(commitment);
    expect(canUse).toBe(true);

    usedCommitments.add(commitment);

    const canReuseFirstTime = !usedCommitments.has(commitment);
    expect(canReuseFirstTime).toBe(false);
  });
});

describe("Threshold Validation", () => {
  it("should validate donation thresholds", () => {
    const thresholds = {
      bronze: 100,
      silver: 500,
      gold: 1000,
    };

    expect(thresholds.bronze).toBe(100);
    expect(thresholds.silver).toBe(500);
    expect(thresholds.gold).toBe(1000);
  });

  it("should check minimum threshold", () => {
    const MIN_THRESHOLD = 100;
    const validAmount = 150;

    expect(validAmount).toBeGreaterThanOrEqual(MIN_THRESHOLD);
  });
});
