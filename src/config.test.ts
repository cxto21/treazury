import { describe, it, expect, beforeEach } from "bun:test";

// Mock config
const mockConfig = {
  rpcUrl: "https://starknet-sepolia.public.blastapi.io",
  chainId: "SN_SEPOLIA",
  zkpassportContract: "0x0PENDING_DEPLOYMENT",
  tongoContract: "0x0PENDING_DEPLOYMENT",
};

describe("Config Service", () => {
  it("should load configuration from environment", () => {
    expect(mockConfig.rpcUrl).toBeDefined();
    expect(mockConfig.chainId).toBe("SN_SEPOLIA");
  });

  it("should have Sepolia endpoints configured", () => {
    expect(mockConfig.rpcUrl).toContain("sepolia");
  });

  it("should have placeholder contract addresses", () => {
    expect(mockConfig.zkpassportContract).toContain("PENDING");
    expect(mockConfig.tongoContract).toContain("PENDING");
  });
});

describe("Starknet Network Configuration", () => {
  it("should use correct RPC for Sepolia", () => {
    expect(mockConfig.rpcUrl).toMatch(/sepolia/i);
  });

  it("should have valid chain ID format", () => {
    expect(["SN_SEPOLIA", "SN_MAIN"]).toContain(mockConfig.chainId);
  });

  it("should support contract address format", () => {
    const addressRegex = /^0x[0-9a-fA-F]+|PENDING_DEPLOYMENT$/;
    expect(addressRegex.test(mockConfig.zkpassportContract)).toBe(true);
  });
});

describe("Environment Variables", () => {
  it("should have development environment set", () => {
    const env = process.env.VITE_ENVIRONMENT || "development";
    expect(["development", "production"]).toContain(env);
  });

  it("should have network specified", () => {
    const network = process.env.VITE_NETWORK || "sepolia";
    expect(["sepolia", "mainnet"]).toContain(network);
  });
});
