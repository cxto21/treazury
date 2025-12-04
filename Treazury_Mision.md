# Treazury Mission

## Context Variables:
- **DesiredApplication**: "Treazury - Truly Invisible USD Vault"
  - **Cyberpunk UI prototype**: Mobile-first black/white + neon details. Hexagon loading gate → encrypted balance (`***1,234.56 USDC`) → private transfer form (amount + recipient) → "Generate ZK Proof + Transfer" [Resource1].
  - **Technical vision**: ZKPassport zero-knowledge KYC + Tongo encrypted USDC transfers + Noir/Garaga STARK proofs leveraging Omar Espejel's privacy toolkit [Resource2].
- **Resources**: 
  - **Resource1**: Treazury Frontend Prototype [https://github.com/cxto21/Treazury---Prototype](https://github.com/cxto21/Treazury---Prototype)
  - **Resource2**: Omar Espejel's Starknet Privacy Toolkit [https://github.com/cxto21/starknet-privacy-toolkit](https://github.com/cxto21/starknet-privacy-toolkit)

## Autonomous Development Instruction
**Operate as autonomous AI agent in controlled GitHub Codespace**. Transform Resource2 template → fully functional Treazury E2E system. Interruptions **only** for manual data input. No risk-based stopping.

## D: Development Stages (N ∈ ℤ, N > 0)

**D1: Initialize /origin/ Security-First Documents**
mkdir /origin/
Generate professional docs:
├── SRS.md → MoSCoW Analysis (CRITICAL MINIMUM):
│ MUST: ZKPassport Cairo verifier (frontend proof → backend verify)
│ MUST: Tongo USDC private transfer (Resource1 form → encrypted tx)
│ MUST: /.Tests/ with file-specific test cases
│ COULD: STRK fee automation
│ WON'T: Analytics dashboard
├── checklist.md → File-by-file transformation (Resource2 → Treazury)
└── README_origin.md → Security-First architecture

**D2: AI Transformation Pipeline**
Upload: Current repo (A-State) + SRS (B-State)
Request: "Checklist: Transform A → B with file-specific changes"


**D3: Test-Driven Planning**
Generate /.Tests/ directory mapping exact files:
├── test_zkpassport_verifier.test.ts → contracts/zk_kyc.cairo
├── test_tongo_usdc.test.ts → src/tongo-integration.ts
├── test_e2e_private_flow.test.ts → src/App.tsx → backend flow
└── test_security_thresholds.test.ts → AML limits
RULE: Test scope FIRST. 3 failures → escalate stage.

text

**D4: Exhaustive Implementation**
Prompt: "Step-by-step implementation passing ALL /.Tests/. Modify ONLY specified files. 100% test completion required."

text

**D5**: Build → Testnet (Starknet Sepolia + STRK faucet)  
**D6**: Automated audit + manual private flow verification  
**D7**: DNS (treazury.xyz)  
**D8**: Mainnet (USDC Native Starknet)  
