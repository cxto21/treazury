# Treazury Deployment to Ztarknet Testnet

## Overview
This guide walks through deploying the TreazuryVault contract to Ztarknet testnet using sncast.

## Prerequisites
- Scarb 2.9.2 installed
- sncast 0.53.0 installed
- Ztarknet testnet account with ZTK funds
- Private key for the account

## Step-by-Step Deployment

### 1. Get Testnet Account and Funds

Visit [Ztarknet Faucet](https://faucet.ztarknet.cash/) to:
- Generate or connect a wallet
- Receive account address and private key
- Claim initial ZTK tokens for gas

**Note down:**
```
Account Address: 0x...
Private Key:    0x...
```

### 2. Configure sncast Profile

The profile is pre-configured at `~/.config/sncast/profiles.toml`:

```toml
[ztarknet]
account_address = "0x..."
private_key = "0x..."
provider.node.url = "https://rpc.ztarknet.cash"
chain_id = "ZTARKNET"
```

Update with your account and private key from Step 1.

### 3. Compile Contract

```bash
cd /workspaces/treazury/donation_badge_verifier
scarb build
```

Expected output:
```
Finished `dev` profile target(s) in Xs
```

### 4. Declare Contract to Ztarknet

```bash
sncast --profile ztarknet declare \
  --contract target/release/donation_badge_verifier_TreazuryVault.contract_class.json
```

**Expected output:**
```
Contract declared at class hash:
0x01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

**Save the class_hash** - you'll need it for deployment.

### 5. Deploy Contract Instance

```bash
sncast --profile ztarknet deploy \
  --class-hash 0x01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

**Expected output:**
```
Contract deployed at:
0x00a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9
```

**Save the contract address** - this is your TreazuryVault on Ztarknet.

### 6. Register Deployment

Update `deployments/ztarknet.json` with:

```json
{
  "contracts": {
    "TreazuryVault": {
      "class_hash": "0x01a2b3c4...",
      "address": "0x00a1b2c3...",
      "declaration_tx": "<tx_hash_from_step_4>",
      "deployment_tx": "<tx_hash_from_step_5>",
      "network": "ztarknet-testnet",
      "deployed_at": "2025-12-04T..."
    }
  }
}
```

### 7. Update Environment Variables

Update `.env.local`:

```bash
VITE_ZKPASSPORT_CONTRACT=0x00a1b2c3...
ZTARKNET_RPC=https://rpc.ztarknet.cash
ZTARKNET_CHAIN_ID=ZTARKNET
```

### 8. Verify Deployment

Visit [Ztarknet Explorer](https://explorer.ztarknet.cash/) and search for your contract address to confirm deployment.

### 9. Automated Deployment Script

Alternatively, use the provided script:

```bash
./deploy-ztarknet.sh 0x<account_address> 0x<private_key>
```

This will:
- Update sncast profile
- Compile contract
- Guide you through declare/deploy
- Register deployment information
- Update environment variables

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| `sncast: command not found` | Install Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/ |
| `Invalid RPC URL` | Verify RPC: https://rpc.ztarknet.cash |
| `Insufficient funds` | Get more ZTK from faucet: https://faucet.ztarknet.cash/ |
| `Class hash mismatch` | Recompile: `scarb build` |

## Testing Deployed Contract

Once deployed, test interactions:

```bash
# Get encrypted balance (should be 0 initially)
sncast --profile ztarknet call \
  --contract-address 0x<your_address> \
  --function get_encrypted_balance \
  --calldata 0x<user_address>

# Set encryption key
sncast --profile ztarknet invoke \
  --contract-address 0x<your_address> \
  --function set_encryption_key \
  --calldata 0x1234567890abcdef
```

## Next Steps

After successful deployment:
1. Run E2E testing checklist (D4_E2E_TESTING_CHECKLIST.md)
2. Prepare security audit package (D4_SECURITY_AUDIT_PACKAGE.md)
3. Collect audit findings
4. Plan D5 mainnet deployment

---

For more details, see:
- [Ztarknet Documentation](https://www.ztarknet.cash/)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)
- [Cairo Documentation](https://docs.cairo-lang.org/)
