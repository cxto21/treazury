# Treazury Makefile
# Based on Ztarknet quickstart, adapted for Treazury deployment
# Supports account management and contract deployment on Ztarknet

.PHONY: install-all install-noir install-scarb install-barretenberg install-sncast \
	setup verify uninstall account-create account-deploy account-balance account-topup \
	contract-build contract-declare contract-deploy dev build test help

help:
	@echo "=== Treazury Development Commands ==="
	@echo ""
	@echo "Installation:"
	@echo "  make install-all         Install all dependencies"
	@echo ""
	@echo "Account Management (Ztarknet):"
	@echo "  make account-create      Create OpenZeppelin account"
	@echo "  make account-deploy      Deploy account to Ztarknet"
	@echo "  make account-topup       Claim ZTK from faucet"
	@echo "  make account-balance     Check account balance"
	@echo ""
	@echo "Contract Deployment:"
	@echo "  make contract-build      Compile TreazuryVault"
	@echo "  make contract-declare    Declare contract on Ztarknet"
	@echo "  make contract-deploy     Deploy contract instance"
	@echo ""
	@echo "Development:"
	@echo "  make dev                 Start dev server"
	@echo "  make build               Build for production"
	@echo "  make test                Run tests"
	@echo ""

# Installer targets (expected by scripts/verify.sh)
install-sncast:
	-./scripts/install-sncast.sh

install-noir:
	-./scripts/install-noir.sh

install-scarb:
	-./scripts/install-scarb.sh

install-barretenberg:
	-./scripts/install-barretenberg.sh

install-all: install-sncast install-noir install-scarb install-barretenberg
	@echo ""
	@echo "================================"
	@echo "Installation Summary"
	@echo "================================"
	@echo ""
	@command -v sncast >/dev/null 2>&1 && echo "✓ sncast: $$(sncast --version 2>&1 | head -1)" || echo "✗ sncast: Not installed (manual setup required)"
	@command -v nargo >/dev/null 2>&1 && echo "✓ nargo: $$(nargo --version 2>&1 | head -1)" || echo "✗ nargo: Not installed"
	@command -v scarb >/dev/null 2>&1 && echo "✓ scarb: $$(scarb --version 2>&1 | head -1)" || echo "✗ scarb: Not installed"
	@command -v bb >/dev/null 2>&1 && echo "✓ bb: $$(bb --version 2>&1)" || echo "✗ bb: Not installed"
	@command -v npm >/dev/null 2>&1 && echo "✓ npm: $$(npm --version)" || echo "✗ npm: Not installed"
	@echo ""

setup:
	./scripts/setup.sh

verify:
	@./scripts/verify.sh

uninstall:
	@./scripts/uninstall.sh

# Account management (expected by scripts/verify.sh)
URL=https://ztarknet-madara.d.karnot.xyz
ACCOUNT_NAME=ztarknet
ACCOUNT_CLASS_HASH=0x01484c93b9d6cf61614d698ed069b3c6992c32549194fc3465258c2194734189
FEE_TOKEN_ADDRESS=0x1ad102b4c4b3e40a51b6fb8a446275d600555bd63a95cdceed3e5cef8a6bc1d

account-create:
	sncast account create \
		--class-hash $(ACCOUNT_CLASS_HASH) \
		--type oz \
		--url $(URL) \
		--name $(ACCOUNT_NAME)

account-topup:
	@echo "Getting account address..."
	@ADDR=$$(sncast account list 2>/dev/null | grep -A 10 "$(ACCOUNT_NAME)" | grep "address:" | awk '{print $$2}'); \
	if [ -z "$$ADDR" ]; then \
		echo "Error: Account '$(ACCOUNT_NAME)' not found."; \
		echo "Run 'make account-create' first to create the account."; \
		exit 1; \
	fi; \
	echo "Account address: $$ADDR"; \
	cd admin && TOPUP_ADDRESS=$$ADDR npm run topup

account-deploy:
	sncast account deploy \
		--url $(URL) \
		--name $(ACCOUNT_NAME)

account-balance:
	sncast balance \
		--token-address $(FEE_TOKEN_ADDRESS) \
		--url $(URL)

# Contract deployment targets
contract-build:
	@echo "Building TreazuryVault contract..."
	cd donation_badge_verifier && scarb build --release
	@echo "✓ TreazuryVault compiled successfully"

contract-declare:
	@echo "Declaring TreazuryVault on Ztarknet..."
	sncast --profile $(ACCOUNT_NAME) declare \
		--contract donation_badge_verifier/target/release/donation_badge_verifier_TreazuryVault.contract_class.json \
		--url $(URL)
	@echo "✓ Contract declared. Note the class_hash for deployment."

contract-deploy:
	@read -p "Enter class_hash from contract-declare: " CLASS_HASH; \
	echo "Deploying TreazuryVault to Ztarknet..."; \
	sncast --profile $(ACCOUNT_NAME) deploy $$CLASS_HASH \
		--url $(URL)
	@echo "✓ Contract deployed. Update deployments/ztarknet.json with contract address."

# Development targets
dev:
	bun run dev

build:
	bun run build

test:
	bun run test
