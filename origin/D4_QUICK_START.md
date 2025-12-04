# D4 Quick Start - Ztarknet Deployment

Guía rápida para ejecutar TreazuryVault en testnet Ztarknet.

## Prerequisites

✓ TreazuryVault contract compilado
✓ Makefile configurado con targets de deployment
✓ sncast 0.53.0 instalado
✓ Scarb 2.9.2 instalado

## 1. Create Ztarknet Account

```bash
make account-create
```

**Output esperado:**
```
Account created:
Account address: 0x123abc...
Private key: 0x456def...
Saved to: ~/.config/sncast/profiles.toml
```

## 2. Fund Your Account

1. Open: https://faucet.ztarknet.cash/
2. Copy your account address from the output above
3. Paste address in faucet
4. Claim ZTK tokens (~5 min processing)

Verify funding:

```bash
make account-balance
```

**Expected output:** Balance > 0

## 3. Deploy Account to Ztarknet

```bash
make account-deploy
```

**Output esperado:**
```
Deploying account...
Deployment txn: 0x789ghi...
Account deployed ✓
```

## 4. Build TreazuryVault

```bash
make contract-build
```

**Output esperado:**
```
Compiling donation_badge_verifier...
Finished `dev` profile in 24 seconds
✓ TreazuryVault compiled successfully
```

## 5. Declare Contract

```bash
make contract-declare
```

**Output esperado:**
```
Declaring TreazuryVault on Ztarknet...
Class hash: 0xabc123...
✓ Contract declared. Note the class_hash for deployment.
```

**Save the class_hash** for next step.

## 6. Deploy Contract Instance

```bash
make contract-deploy
```

When prompted, paste the class_hash from step 5:

```
Enter class_hash from contract-declare: 0xabc123...
Deploying TreazuryVault to Ztarknet...
Contract address: 0xdef456...
✓ Contract deployed. Update deployments/ztarknet.json with contract address.
```

## 7. Verify Deployment

Update `deployments/ztarknet.json`:

```json
{
  "treazury_vault": {
    "class_hash": "0xabc123...",
    "contract_address": "0xdef456...",
    "deployment_tx": "0x789ghi...",
    "block": 12345,
    "timestamp": "2025-01-XX"
  }
}
```

Verify on block explorer:
- https://ztarknet-madara.d.karnot.xyz/ (if available)

## 8. Run E2E Tests

See: `origin/D4_ZTARKNET_E2E_TESTING.md`

```bash
make test
```

## 9. Next Steps

- [ ] E2E testing complete
- [ ] Security audit scheduled
- [ ] Frontend integration with deployed contract
- [ ] Mainnet deployment planning

---

## Troubleshooting

### Account creation fails

```bash
# Clear existing config
rm -f ~/.config/sncast/profiles.toml

# Recreate
make account-create
```

### Balance check fails

```bash
# Verify sncast installation
sncast --version

# Check Ztarknet RPC is accessible
curl -X POST https://ztarknet-madara.d.karnot.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"starknet_chainId","params":[],"id":1}'
```

### Contract declaration fails

Ensure:
1. Account is deployed (`make account-deploy` succeeded)
2. Account has ZTK balance (`make account-balance` > 0)
3. Contract compiled (`make contract-build` succeeded)
4. Scarb version >= 2.9.2

### Deployment timeout

Retry with explicit URL:

```bash
sncast --profile ztarknet deploy 0xabc123... \
  --url https://ztarknet-madara.d.karnot.xyz
```

---

**Status:** Ready for deployment

**Timeline:**
- Account creation: 2 min
- Faucet funding: 5 min (user waiting)
- Account deployment: 2 min
- Contract declare: 2 min
- Contract deploy: 2 min
- **Total: ~15 min**

**Next in conversation:** User executes Step 1 with `make account-create`
