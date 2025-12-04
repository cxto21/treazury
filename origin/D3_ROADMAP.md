# Treazury - Roadmap D3 & Beyond

## Fase D3: E2E Testing & Sepolia Deployment

### Objetivos D3
1. ✓ Write E2E tests in `/.Tests/` covering all flows
2. ✓ Deploy Cairo verifier to Starknet Sepolia
3. ✓ Integrate real Noir/Garaga proof generation
4. ✓ Connect frontend to on-chain verification

### Checklist D3

#### Testing Infrastructure
- [ ] Finalize `/.Tests/test_zkpassport_verifier.test.ts`
  - Mock Cairo contract responses
  - Test proof generation flow
  - Verify proof validation logic
  
- [ ] Finalize `/.Tests/test_tongo_usdc.test.ts`
  - Mock Tongo SDK responses
  - Test encrypted balance fetch
  - Test private transfer initiation
  
- [ ] Finalize `/.Tests/test_e2e_private_flow.test.ts`
  - Full UI → service → contract flow
  - Error scenarios (invalid proofs, insufficient balance)
  - Success path with tx hash verification
  
- [ ] Finalize `/.Tests/test_security_thresholds.test.ts`
  - AML limit enforcement
  - Rate limiting
  - Address validation

#### Cairo Verifier (zkpassport_verifier)
- [ ] Define complete ABI for `verify_kyc`
  - Public inputs: `subject_address`, `kyc_level`
  - Private inputs: `proof`, `hints`
  - Return: `is_valid` (bool)
  
- [ ] Implement storage for verified addresses
  - `kyc_levels: LegacyMap<ContractAddress, u32>`
  - Track verification status + expiration

- [ ] Write snforge tests with real Cairo logic
  - Test proof validation path
  - Test storage updates
  - Test event emission

#### Noir Circuit Integration
- [ ] Review/adapt `zk-badges/donation_badge` circuit
  - Change inputs to KYC-specific (identity, level)
  - Integrate Garaga STARK verification
  
- [ ] Implement `generateZKPassportProof()` real call
  - Use Noir compiler (nargo)
  - Call Barretenberg prover
  - Return calldata-compatible format

#### Frontend-Backend Wiring
- [ ] Update `src/web/services.ts`
  - Replace `generateZKPassportProof()` placeholder
  - Connect to actual Noir proving
  - Real RPC calls for `verifyProofOnChain()`
  
- [ ] Update `VaultInterface.tsx`
  - Real wallet connection (get-starknet)
  - Actual balance from Starknet network
  - Real transaction submission

#### Deployment Configuration
- [ ] Update `deployments/sepolia.json`
  - Deploy verifier contract
  - Record address
  - Note block number
  
- [ ] Configure Cloudflare Pages
  - Setup Wrangler (wrangler.toml)
  - CI/CD pipeline (GitHub Actions)
  - Environment variables (RPC, contract address)
  
- [ ] Create deployment guide
  - Step-by-step Sepolia deploy
  - Manual testing checklist
  - Monitoring + alerts

### Success Criteria D3
- [ ] All tests in `/.Tests/` passing (100% coverage)
- [ ] Verifier deployed to Sepolia
- [ ] Frontend connects to real verifier contract
- [ ] End-to-end flow tested on testnet
- [ ] Cloudflare Pages build automated

---

## Fase D4: Mainnet & Production

### Objectives D4
1. Security audit (contract + frontend)
2. Deploy to Starknet Mainnet
3. Production Cloudflare Pages setup
4. Public beta launch

### Key Tasks
- [ ] Smart contract audit (formal verification)
- [ ] Frontend security review (dependencies, auth)
- [ ] DNS setup (treazury.xyz)
- [ ] Documentation finalization
- [ ] User onboarding flow
- [ ] Community feedback loop

---

## Fase D5-D8: Scaling & Governance

### D5: Build → Scale
- Multi-chain support (arbitrum, polygon)
- Mobile app (React Native)
- Advanced privacy (multi-sig, timelocks)

### D6: Audit → Verification
- Independent audits
- Formal verification (Cairo logic)
- Community-driven testing

### D7: DNS → Brand
- Domain setup
- Marketing site
- Community building

### D8: Mainnet → Governance
- DAO token launch
- Decentralized governance
- Community treasury

---

## Important Notes

### Environment Variables (.env.local)
```bash
# Sepolia
STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
ZKPASSPORT_CONTRACT=0x0...  # Will be set after deploy

# Mainnet (D4+)
STARKNET_MAINNET_RPC=https://starknet-mainnet.public.blastapi.io
ZKPASSPORT_MAINNET_CONTRACT=0x0...

# Noir proving
NOIR_COMPILER_PATH=/path/to/nargo
BARRETENBERG_PATH=/path/to/bb
```

### Build Commands
```bash
# Development
bun run dev:web                    # Start dev server

# Testing
bun run test                       # Run all tests
bun run test:unit                  # Unit tests only
bun run test:e2e                   # E2E tests only

# Production
bun run build:web                  # Build frontend
bun run build                      # Build backend
bun run deploy                     # Deploy to Cloudflare Pages + Sepolia

# Verification
bun run type-check                 # TypeScript check
bun run lint                       # ESLint + Prettier
```

### Critical Files to Update
1. `/.Tests/*` - Implement real test logic
2. `zkpassport_verifier/src/zkpassport_verifier.cairo` - Full ABI + storage
3. `src/web/services.ts` - Replace placeholders with real calls
4. `deployments/sepolia.json` - Add deployed addresses
5. `wrangler.toml` - Configure Cloudflare Pages

### Security Considerations
- ✓ No secrets in repo (use .env.local)
- ✓ Validate all inputs (frontend + contract)
- ✓ Rate limit RPC calls
- ✓ Test proof verification thoroughly
- ✓ Audit AML thresholds
- ✓ Document privacy guarantees

---

## Contact & Support

For implementation questions, refer to:
- `Treazury_Mision.md` - Original requirements
- `origin/SRS.md` - Detailed specifications
- `origin/README_origin.md` - Architecture overview
- `origin/D2_SUMMARY.md` - Current phase summary

---

**Last Updated**: Dec 4, 2025  
**Current Phase**: D2 Complete ✓ → D3 Ready  
**Next Milestone**: E2E Tests + Sepolia Deployment
