# ZKPassport Testing Plan

**Scope**: Comprehensive test coverage for Noir circuit, Cairo contract, and end-to-end flows  
**Timeline**: 1-2 days  
**Status**: Ready to begin

---

## Phase 1: Noir Circuit Testing (4-6 hours)

### 1.1 Unit Tests - Input Validation

**Test Case: Valid US Passport**
```
Inputs:
  nationality: "USA"
  document_number: "N1234567"
  date_of_birth: "920315"
  sex: 77 (M)
  document_expiry: "261231"
  
Expected: ✅ All validation steps pass
```

**Test Case: Invalid Nationality Code**
```
Inputs:
  nationality: "XX"  (invalid ISO code)
  
Expected: ❌ Validation fails at Step 1
Reason: Invalid nationality code
```

**Test Case: Invalid DOB Format**
```
Inputs:
  date_of_birth: "921301"  (month 13 = invalid)
  
Expected: ❌ Validation fails at Step 1
Reason: Invalid date format
```

### 1.2 Unit Tests - MRZ Validation

**Test Case: Valid ICAO MRZ**
```
MRZ Line 1: P<USADOE00000002<<<<<<<<<<<<<<<<<<<<<<<<
MRZ Line 2: 9203150M2612315USA<<<<<<<<<<<<<<<<<<<<<6

Expected: ✅ Format and checksums valid
Details:
  - Line 1: 44 chars, starts with 'P'
  - Line 2: 44 chars, numeric fields correct
  - All checksums: Valid MOD-97
```

**Test Case: Invalid MRZ Checksum**
```
MRZ Line 2: 9203150M2612315USA<<<<<<<<<<<<<<<<<<<<<7  (last digit wrong)

Expected: ❌ Final checksum fails
```

**Test Case: Invalid MRZ Field Length**
```
MRZ Line 1: P<USADOE0000000  (too short)

Expected: ❌ Format validation fails
Reason: Expected 44 characters
```

### 1.3 Integration Tests - Hash Commitment

**Test Case: Hash Commitment Verification**
```
Inputs (Private):
  nationality: "USA"
  document_number: "N1234567"
  date_of_birth: "920315"

Public Inputs (Precomputed Hashes):
  nationality_hash: Poseidon(nationality)
  doc_hash: Poseidon(document_number)
  dob_hash: Poseidon(date_of_birth)

Expected: ✅ Circuit computes matching hashes
Flow: Private inputs → Hash computation → Match public inputs → Proof
```

### 1.4 KYC Level Assignment Tests

**Test Case: Basic KYC (Level 1)**
```
Requirements:
  - Valid nationality
  - Valid document format
  - Passport type
  
Expected: ✅ KYC Level = 1 assigned
```

**Test Case: Enhanced KYC (Level 2)**
```
Requirements:
  - Valid nationality
  - Not expired
  - Document type: ID Card
  
Inputs:
  document_expiry: "261231"  (valid, expires 2026)
  
Expected: ✅ KYC Level = 2 assigned
```

**Test Case: Premium KYC (Level 3)**
```
Requirements:
  - Valid nationality
  - Not expired
  - Age >= 18
  - Document type: Travel Document
  
Inputs:
  date_of_birth: "920315"  (born 1992, currently 33 years old)
  document_expiry: "261231"  (valid)
  
Expected: ✅ KYC Level = 3 assigned
```

**Test Case: Expired Document (KYC Rejected)**
```
Inputs:
  document_expiry: "200101"  (expired in 2020)
  kyc_level_requested: 2
  
Expected: ❌ Circuit fails
Reason: Document expired
```

**Test Case: Age Under 18 (Premium KYC Rejected)**
```
Inputs:
  date_of_birth: "080315"  (born 2008, currently 17 years old)
  kyc_level_requested: 3
  
Expected: ❌ Circuit fails
Reason: Age < 18
```

---

## Phase 2: Cairo Contract Testing (2-3 hours)

### 2.1 Storage Tests

**Test Case: Store KYC Level**
```
Action: Call verify_kyc(alice_address, kyc_level=1)
Expected: 
  - kyc_levels[alice_address] = 1
  - verification_timestamps[alice_address] = current_block_time
  - is_kyc_verified(alice_address) returns true
```

**Test Case: No Downgrade Allowed**
```
Sequence:
  1. verify_kyc(alice_address, kyc_level=2)  → Stored: 2
  2. verify_kyc(alice_address, kyc_level=1)  → Should fail
  
Expected: ❌ Second call rejected
Reason: Cannot downgrade KYC level
```

### 2.2 Revocation Tests

**Test Case: Admin Revocation**
```
Action: revoke_kyc(alice_address)
Expected:
  - kyc_levels[alice_address] = 0
  - is_kyc_verified(alice_address) returns false
```

**Test Case: Non-Admin Cannot Revoke**
```
Setup: bob_address != owner
Action: bob calls revoke_kyc(alice_address)
Expected: ❌ Call rejected
Reason: Not admin
```

### 2.3 Replay Protection Tests

**Test Case: Same Proof Cannot Be Used Twice**
```
Sequence:
  1. submit_proof(proof_commitment_1, kyc_level=1) → ✅ Success
  2. submit_proof(proof_commitment_1, kyc_level=1) → ❌ Replay detected
  
Expected: ❌ Second submission rejected
```

---

## Phase 3: End-to-End Testing (4-6 hours)

### 3.1 Full Flow: Capture → Parse → Prove → Verify

**Test Case: E2E Valid Passport**
```
1. Frontend: Capture passport image
2. Frontend: OCR via Tesseract.js
3. Frontend: Extract MRZ lines
4. Frontend: Parse fields
5. Backend: POST /api/zkpassport/generate-proof
6. Backend: Compute Poseidon hashes
7. Backend: Invoke Noir circuit
8. Barretenberg: Generate STARK proof
9. Frontend: Send proof to contract
10. Contract: verify_kyc(proof, public_inputs, kyc_level)
11. Contract: Emit VerificationSuccess event
12. Frontend: Display KYC status

Expected: ✅ All steps succeed, KYC verified on-chain
```

### 3.2 Real Passport Data Testing

**Test Case: US Passport (Valid)**
```
Sample MRZ:
P<USADOE00000002<<<<<<<<<<<<<<<<<<<<<<<<
9203150M2612315USA<<<<<<<<<<<<<<<<<<<<<6

Expected: ✅ Proof generated, KYC verified
```

**Test Case: EU Passport (Valid)**
```
Sample MRZ:
P<DESMITH0000000<<<<<<<<<<<<<<<<<<<<<<<<
7001017F2512308DEU<<<<<<<<<<<<<<<<<<<<<0

Expected: ✅ Proof generated, KYC verified (German passport)
```

**Test Case: Expired Passport (Invalid)**
```
Sample MRZ:
P<USAJONES0000000<<<<<<<<<<<<<<<<<<<<<<<
9203150M1501015USA<<<<<<<<<<<<<<<<<<<<<0 (expires 2015)

Expected: ❌ Proof fails, KYC not verified
Reason: Document expired
```

### 3.3 OCR Edge Cases

**Test Case: Poor Image Quality**
```
Setup: Passport image with shadows/glare
Expected: ❌ OCR may fail or extract wrong data
Action: Should error gracefully with user message
```

**Test Case: Partially Obscured MRZ**
```
Setup: MRZ line partially covered
Expected: ❌ Checksum validation fails
Action: Should reject with specific error
```

---

## Phase 4: Security Testing (2-3 hours)

### 4.1 Adversarial Input Testing

**Test Case: Checksum Forgery**
```
Attacker Action: Modify single digit in MRZ checksum
Example: Change last checksum from 6 → 5

Expected: ❌ Checksum validation fails
Security: ✅ Prevents MRZ tampering
```

**Test Case: Field Substitution**
```
Attacker Action: Change date fields in MRZ
Scenario: Change DOB from 920315 → 800315 (to appear older)

Expected: ❌ Proof fails
Reason: Extracted DOB won't match input DOB
Security: ✅ Prevents age manipulation
```

**Test Case: Hash Preimage Attack**
```
Attacker Action: Try to reverse Poseidon hash
Example: Given nationality_hash, find original nationality

Expected: ❌ Computationally infeasible
Security: ✅ 2^252 operations required
```

### 4.2 Privacy Testing

**Test Case: Personal Data Never Exposed**
```
Monitoring: Network traffic during KYC process
Checking:
  - No personal data in API calls (only hashes)
  - No images transmitted
  - No plain text fields in transaction data
  - Only hashes stored on-chain
  
Expected: ✅ All privacy properties maintained
```

### 4.3 Timestamp Validation

**Test Case: Future Timestamp Rejected**
```
Input: verification_timestamp = current_time + 1 month

Expected: ⚠️ Depends on oracle implementation
Status: Currently not strict (needs oracle)
```

---

## Test Data Collection

### Scenario 1: Valid Passports (Multiple Countries)

| Country | Type | DOB | Expiry | Expected KYC |
|---------|------|-----|--------|--------------|
| USA | Passport | 920315 (33y) | 261231 | Level 3 |
| Germany | ID Card | 750820 (50y) | 301005 | Level 3 |
| Spain | Passport | 051210 (19y) | 251120 | Level 3 |
| France | Travel Doc | 081225 (16y) | 281220 | Level 1 |
| Italy | ID Card | 991130 (25y) | 241215 | Level 3 |

### Scenario 2: Invalid Cases

| Case | Reason | Expected |
|------|--------|----------|
| Expired passport | Expiry: 200101 | ❌ Rejected |
| Under 18 for premium | DOB: 080315 | ❌ Rejected |
| Invalid checksum | Modified MRZ | ❌ Rejected |
| Wrong nationality | Invalid ISO code | ❌ Rejected |
| Bad date format | DOB: "92/03/15" | ❌ Rejected |

---

## Test Execution Plan

### Week 1: Day 4-5 (Thursday-Friday)

```
Thursday:
  ✓ 4:00 - Start Noir circuit unit tests
  ✓ 5:00 - Complete MRZ validation tests
  ✓ 6:00 - Hash commitment tests
  ✓ 7:00 - KYC level assignment tests
  ✓ 8:00 - Break/review

Friday:
  ✓ 9:00 - Cairo contract unit tests
  ✓ 10:00 - Storage and revocation tests
  ✓ 11:00 - Replay protection tests
  ✓ 12:00 - Lunch

Afternoon (Friday):
  ✓ 13:00 - Full E2E testing setup
  ✓ 14:00 - E2E with test data
  ✓ 15:00 - Real passport data tests
  ✓ 16:00 - Security/adversarial tests
  ✓ 17:00 - Fix any issues found
```

### Week 2: Day 6-7 (Monday-Tuesday)

```
Monday:
  ✓ 9:00 - Regression testing (all tests pass)
  ✓ 10:00 - Performance testing
  ✓ 11:00 - Documentation review
  ✓ 12:00 - Final commit

Afternoon (Monday):
  ✓ 13:00 - Deployment prep
  ✓ 14:00 - Sepolia testnet deployment
  ✓ 15:00 - Post-deployment E2E
  ✓ 16:00 - Documentation update

Tuesday:
  ✓ 9:00 - Production hardening
  ✓ 10:00 - Security audit review
  ✓ 11:00 - Final verification
  ✓ 12:00 - Complete & submit
```

---

## Success Criteria

✅ **All circuit tests pass** (unit + integration)  
✅ **All contract tests pass** (storage + revocation + replay)  
✅ **E2E flow works completely** (capture → prove → verify)  
✅ **Real passport data succeeds** (multiple countries)  
✅ **Security tests pass** (no data leakage, checksums validated)  
✅ **No regressions** (all tests repeatable)  
✅ **Documentation updated** (test procedures documented)  

---

## Test Results Template

```markdown
## Test Results - [Date]

### Noir Circuit Tests
- [ ] Valid US passport: PASS/FAIL
- [ ] Invalid nationality: PASS/FAIL
- [ ] Invalid DOB: PASS/FAIL
- [ ] Valid MRZ: PASS/FAIL
- [ ] Invalid checksum: PASS/FAIL
- [ ] Hash commitment: PASS/FAIL
- [ ] Basic KYC: PASS/FAIL
- [ ] Enhanced KYC: PASS/FAIL
- [ ] Premium KYC: PASS/FAIL
- [ ] Expired document: PASS/FAIL

### Cairo Contract Tests
- [ ] Store KYC level: PASS/FAIL
- [ ] No downgrade: PASS/FAIL
- [ ] Admin revocation: PASS/FAIL
- [ ] Replay protection: PASS/FAIL

### E2E Tests
- [ ] Full flow: PASS/FAIL
- [ ] US passport: PASS/FAIL
- [ ] EU passport: PASS/FAIL
- [ ] Expired passport: PASS/FAIL

### Security Tests
- [ ] Checksum forgery: PASS/FAIL
- [ ] Hash privacy: PASS/FAIL

**Total**: X/X tests passed
**Status**: ✅ READY FOR DEPLOYMENT / ⚠️ NEEDS FIXES
```

---

**Document Created**: December 4, 2025  
**Status**: Testing plan complete, ready to execute  
**Next Action**: Begin Phase 1 (Noir circuit unit tests)
