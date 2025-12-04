#!/bin/bash
# USDC Testnet Testing Script
# Usage: chmod +x test-usdc-sepolia.sh && ./test-usdc-sepolia.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🪙 USDC Testnet Testing Suite for Treazury${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Check environment
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cat > .env.local << 'EOF'
# Starknet Sepolia
STARKNET_RPC_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/YOUR_KEY
STARKNET_CHAIN_ID=SN_SEPOLIA

# Wallet (for CLI testing)
STARKNET_ACCOUNT_ADDRESS=0x
STARKNET_PRIVATE_KEY=0x

# Tongo & USDC
TONGO_CONTRACT_ADDRESS=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
USDC_ADDRESS=0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
EOF
    echo -e "${GREEN}✓ Created .env.local. Please update with your values.${NC}\n"
fi

source .env.local

# Test 1: Check environment variables
echo -e "${BLUE}[TEST 1] Checking Environment Variables${NC}"
if [ -z "$STARKNET_RPC_URL" ]; then
    echo -e "${RED}✗ STARKNET_RPC_URL not set${NC}"
    exit 1
fi
if [ -z "$STARKNET_ACCOUNT_ADDRESS" ]; then
    echo -e "${YELLOW}⚠ STARKNET_ACCOUNT_ADDRESS not set (needed for CLI testing)${NC}"
else
    echo -e "${GREEN}✓ STARKNET_ACCOUNT_ADDRESS set${NC}"
fi
if [ -z "$STARKNET_PRIVATE_KEY" ]; then
    echo -e "${YELLOW}⚠ STARKNET_PRIVATE_KEY not set (needed for transactions)${NC}"
else
    echo -e "${GREEN}✓ STARKNET_PRIVATE_KEY set${NC}"
fi
echo

# Test 2: Check RPC connectivity
echo -e "${BLUE}[TEST 2] Testing RPC Connectivity${NC}"
RPC_RESPONSE=$(curl -s -X POST "$STARKNET_RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "method": "starknet_chainId",
        "params": [],
        "id": 1
    }')

if echo "$RPC_RESPONSE" | grep -q "SN_SEPOLIA"; then
    echo -e "${GREEN}✓ RPC connection successful${NC}"
    echo -e "  Network: Sepolia"
else
    echo -e "${RED}✗ RPC connection failed${NC}"
    echo "  Response: $RPC_RESPONSE"
    exit 1
fi
echo

# Test 3: Check wallet balance
echo -e "${BLUE}[TEST 3] Checking Wallet Balances${NC}"
if [ -n "$STARKNET_ACCOUNT_ADDRESS" ]; then
    # TODO: Implement balance check with starknet.js
    echo -e "${YELLOW}⚠ Balance check requires starknet.js integration${NC}"
    echo "  Address: ${STARKNET_ACCOUNT_ADDRESS:0:10}...${STARKNET_ACCOUNT_ADDRESS: -8}"
else
    echo -e "${YELLOW}⚠ Skipping balance check (no wallet configured)${NC}"
fi
echo

# Test 4: Check contract addresses
echo -e "${BLUE}[TEST 4] Verifying Contract Addresses${NC}"
echo -e "  Tongo Contract: ${TONGO_CONTRACT_ADDRESS:0:10}...${TONGO_CONTRACT_ADDRESS: -8}"
echo -e "  USDC Contract:  ${USDC_ADDRESS:0:10}...${USDC_ADDRESS: -8}"

# Validate hex format
if [[ "$TONGO_CONTRACT_ADDRESS" =~ ^0x[0-9a-fA-F]+$ ]]; then
    echo -e "${GREEN}✓ Tongo contract address valid${NC}"
else
    echo -e "${RED}✗ Invalid Tongo contract address format${NC}"
fi

if [[ "$USDC_ADDRESS" =~ ^0x[0-9a-fA-F]+$ ]]; then
    echo -e "${GREEN}✓ USDC contract address valid${NC}"
else
    echo -e "${RED}✗ Invalid USDC contract address format${NC}"
fi
echo

# Test 5: Build frontend
echo -e "${BLUE}[TEST 5] Building Frontend${NC}"
if npm run build:web > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    tail -20 /tmp/build.log
    exit 1
fi
echo

# Test 6: Type checking
echo -e "${BLUE}[TEST 6] TypeScript Type Checking${NC}"
if npm run type-check > /tmp/typecheck.log 2>&1; then
    echo -e "${GREEN}✓ Type checking passed${NC}"
else
    echo -e "${RED}✗ Type checking failed${NC}"
    tail -20 /tmp/typecheck.log
fi
echo

# Test 7: Start dev server (optional)
echo -e "${BLUE}[TEST 7] Development Server${NC}"
echo -e "${YELLOW}Start development server with: bun run dev:web${NC}"
echo -e "Then open: http://localhost:3000"
echo

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All critical tests passed!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. Start dev server:"
echo -e "   ${YELLOW}bun run dev:web${NC}"
echo -e ""
echo -e "2. Connect wallet to Starknet Sepolia testnet"
echo -e ""
echo -e "3. Verify USDC balance in your wallet"
echo -e ""
echo -e "4. Test Fund flow:"
echo -e "   - Click 'Fund' in Tongo Card"
echo -e "   - Approve USDC"
echo -e "   - Fund with test amount"
echo -e ""
echo -e "5. Monitor transactions on Starkscan:"
echo -e "   ${YELLOW}https://sepolia.starkscan.io/${NC}"
echo -e ""
echo -e "For detailed guide, see: ${YELLOW}USDC_TESTNET_GUIDE.md${NC}"
echo
