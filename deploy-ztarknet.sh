#!/bin/bash

# Treazury Ztarknet Deployment Script
# Uso: ./deploy-ztarknet.sh <account_address> <private_key>

set -e

ACCOUNT_ADDRESS=$1
PRIVATE_KEY=$2

if [ -z "$ACCOUNT_ADDRESS" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: ./deploy-ztarknet.sh <account_address> <private_key>"
    echo ""
    echo "Example:"
    echo "  ./deploy-ztarknet.sh 0x123abc456def 0xabcdef123456"
    exit 1
fi

PROFILES_FILE="/root/.config/sncast/profiles.toml"
DEPLOYMENTS_FILE="/workspaces/treazury/deployments/ztarknet.json"
CONTRACT_DIR="/workspaces/treazury/donation_badge_verifier"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  TREAZURY DEPLOYMENT TO ZTARKNET                           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Update sncast profile
echo "[STEP 1] Actualizar perfil sncast con datos del faucet..."
sed -i "s|account_address = \"0x0PENDING_FAUCET\"|account_address = \"$ACCOUNT_ADDRESS\"|g" "$PROFILES_FILE"
sed -i "s|private_key = \"0x0PENDING_FAUCET\"|private_key = \"$PRIVATE_KEY\"|g" "$PROFILES_FILE"
echo "✓ Perfil actualizado en: $PROFILES_FILE"
echo ""

# Step 2: Verify contract compilation
echo "[STEP 2] Verificar compilación del contrato..."
cd "$CONTRACT_DIR"
scarb build
echo "✓ Contrato compilado exitosamente"
echo ""

# Step 3: Display declaration command
echo "[STEP 3] Preparar declaración del contrato..."
CONTRACT_CLASS="target/release/donation_badge_verifier_TreazuryVault.contract_class.json"
if [ ! -f "$CONTRACT_CLASS" ]; then
    echo "❌ Error: No se encontró $CONTRACT_CLASS"
    exit 1
fi

echo "Comando para declarar:"
echo "  sncast --profile ztarknet declare --contract $CONTRACT_CLASS"
echo ""
echo "Ejecuta este comando en otra terminal y obtén el class_hash"
echo "Luego, pega el class_hash aquí para continuar con el deploy"
echo ""

read -p "Ingresa el class_hash (0x...): " CLASS_HASH

if [ -z "$CLASS_HASH" ]; then
    echo "❌ Error: class_hash no proporcionado"
    exit 1
fi

echo "✓ class_hash recibido: $CLASS_HASH"
echo ""

# Step 4: Deploy contract
echo "[STEP 4] Desplegar instancia del contrato..."
echo "Comando para desplegar:"
echo "  sncast --profile ztarknet deploy --class-hash $CLASS_HASH"
echo ""

read -p "Ejecuta el comando anterior y pega la dirección del contrato (0x...): " CONTRACT_ADDRESS

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: contract address no proporcionado"
    exit 1
fi

echo "✓ Contract address recibido: $CONTRACT_ADDRESS"
echo ""

# Step 5: Update deployments/ztarknet.json
echo "[STEP 5] Registrar información en deployments/ztarknet.json..."
jq ".contracts.TreazuryVault.class_hash = \"$CLASS_HASH\" | .contracts.TreazuryVault.address = \"$CONTRACT_ADDRESS\" | .account.address = \"$ACCOUNT_ADDRESS\"" "$DEPLOYMENTS_FILE" > "$DEPLOYMENTS_FILE.tmp"
mv "$DEPLOYMENTS_FILE.tmp" "$DEPLOYMENTS_FILE"
echo "✓ Información registrada en: $DEPLOYMENTS_FILE"
echo ""

# Step 6: Update .env.local
echo "[STEP 6] Actualizar .env.local con dirección del contrato..."
ENV_FILE="/workspaces/treazury/.env.local"
sed -i "s|VITE_ZKPASSPORT_CONTRACT=.*|VITE_ZKPASSPORT_CONTRACT=$CONTRACT_ADDRESS|g" "$ENV_FILE"
echo "✓ .env.local actualizado"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                     DEPLOYMENT COMPLETADO ✓                               ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Información del deployment:"
echo "  Cuenta:            $ACCOUNT_ADDRESS"
echo "  Contract Class:    $CLASS_HASH"
echo "  Contract Address:  $CONTRACT_ADDRESS"
echo "  Network:           Ztarknet Testnet"
echo "  RPC:               https://rpc.ztarknet.cash"
echo "  Explorer:          https://explorer.ztarknet.cash/"
echo ""
echo "Próximos pasos:"
echo "  1. Validar en explorer: https://explorer.ztarknet.cash/contract/$CONTRACT_ADDRESS"
echo "  2. Ejecutar E2E tests"
echo "  3. Preparar audit package"
echo ""
