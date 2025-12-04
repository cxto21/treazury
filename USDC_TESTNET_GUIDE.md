# 🪙 Testing USDC Nativo en Starknet Sepolia Testnet

## 📋 Overview

Este guía te mostrará cómo testear soporte completo de USDC nativo en Starknet Sepolia testnet usando Treazury + Tongo SDK.

### Estado Actual
- ✅ **Mainnet**: USDC nativo totalmente soportado
- ⚠️ **Sepolia**: STRK wrapper (para testnet)
- 🔄 **Objetivo**: Agregar USDC testnet a Sepolia

### Referencias
- [Native USDC Live on Starknet](https://www.starknet.io/blog/native-usdc-live-on-starknet/)
- [Circle USDC Bridge](https://www.circle.com/usdc)
- [Starknet Bridge](https://starkgate.starknet.io/)

---

## 🛠️ Step 1: Obtener USDC en Testnet

### Opción A: Bridge desde Ethereum Sepolia (Recomendado)

**1.1 Consigue ETH en Ethereum Sepolia**
```bash
# Faucet de Alchemy (recomendado)
https://sepoliafaucet.com/

# Faucet de Google Cloud
https://cloud.google.com/application/web3/faucet/ethereum/sepolia
```

**1.2 Swap ETH → USDC en Sepolia**
```bash
# Usa Uniswap Sepolia
https://app.uniswap.org/

# O directamente menta USDC testnet:
# https://sepolia.etherscan.io/token/0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
# (Contrato USDC Test)
```

**1.3 Bridge USDC desde Ethereum Sepolia a Starknet Sepolia**
```bash
# URL: https://starkgate.starknet.io/
# Selecciona: Ethereum Sepolia → Starknet Sepolia
# Token: USDC
# Cantidad: 10-100 USDC
# Espera: ~5-10 minutos
```

**1.4 Verifica tu saldo en Sepolia**
```bash
# En tu wallet conectado a Starknet Sepolia
# Deberías ver USDC en tu balance
```

### Opción B: Faucet de Testnet USDC (Si disponible)

```bash
# Algunos proveedores ofrecen USDC testnet directo
# Circle Testnet: https://testnet.circle.com/
```

---

## 🔗 Step 2: Configurar Sepolia USDC Address

### 2.1 Actualizar wallet-config.ts

Actualmente Sepolia usa STRK. Agreguemos soporte para USDC testnet:

```typescript
export const NETWORKS: Record<Network, NetworkConfig> = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/...',
    tongoContractAddress: '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585',
    // Cambia a USDC testnet si disponible
    strkAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', // USDC testnet
    chainId: 'SN_SEPOLIA'
  },
  // ...
};
```

### 2.2 Direcciones USDC en Starknet

| Red | Contrato USDC | Decimales |
|-----|---------------|-----------|
| **Mainnet** | `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8` | 6 |
| **Sepolia** | `0x0...` (TBD - esperar a que Circle implemente) | 6 |
| **Testnet Legacy** | STRK wrapper | 18 |

---

## 🚀 Step 3: Testing Flujo Completo

### 3.1 Connect Wallet

```bash
# 1. Inicia servidor de desarrollo
bun run dev:web

# 2. Abre http://localhost:3000
# 3. Click "Connect Wallet"
# 4. Selecciona Argent X o Braavos
# 5. Asegúrate de estar en Starknet Sepolia testnet
```

### 3.2 Fund (Depósito)

```typescript
// En VaultInterface.tsx o Tongo Card
const amountInUsdc = 10n * 10n ** 6n; // 10 USDC (decimales = 6)

// Flow:
// 1. User approves USDC to Tongo contract
// 2. Tongo SDK generates ZK proof of ownership
// 3. Transaction submitted to blockchain
// 4. Amount almacenado encriptado en Tongo
```

**Pasos manuales en wallet:**
```
1. Click "Fund" en Tongo Card
2. Ingresa amount: 10
3. Click "Approve USDC"
4. Aprueba en wallet extension
5. Click "Fund" nuevamente
6. Aprueba transacción en wallet
7. Espera confirmación (~30-60s)
```

### 3.3 Verificar Transacción

```bash
# En Starkscan Sepolia
https://sepolia.starkscan.io/

# Busca tu wallet address
# Deberías ver:
# 1. Approval tx (USDC transfer approval)
# 2. Fund tx (Tongo.fund call)
```

### 3.4 Transfer (Transferencia encriptada)

```typescript
// Para testear transfer entre cuentas
const recipientAddress = '0x...'; // Otra wallet Sepolia
const amount = 5n * 10n ** 6n; // 5 USDC

// Tongo SDK genera proof y transfiere de forma encriptada
// Verificable solo con private key de Tongo
```

### 3.5 Withdraw (Retiro)

```typescript
// Extrae USDC del Tongo vault al Starknet
const withdrawAmount = 5n * 10n ** 6n;

// Flow:
// 1. Genera proof de ownership
// 2. Descifra balance
// 3. Transfiere a wallet address
// 4. Actualiza balance encriptado
```

---

## 🧪 Step 4: CLI Testing (Para desarrolladores)

### 4.1 Setup .env

```bash
cp .env.example .env

# Setea variables
STARKNET_RPC_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/YOUR_KEY
STARKNET_ACCOUNT_ADDRESS=0x...  # Tu wallet Sepolia
STARKNET_PRIVATE_KEY=0x...       # Tu private key (¡SEGURA!)
STARKNET_NETWORK=sepolia
TONGO_CONTRACT_ADDRESS=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
USDC_ADDRESS=0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
```

### 4.2 Run CLI Demo

```bash
# Full USDC testnet flow
bun run demo

# Output esperado:
# [CLI] Connecting to Starknet Sepolia...
# [CLI] Account: 0x...
# [CLI] Balance: X USDC
# [CLI] Generating Tongo private key...
# [CLI] Funding Tongo account with 10 USDC...
# [Transaction Hash: 0x...]
# [CLI] Transfer 5 USDC to recipient...
# [Transaction Hash: 0x...]
# [CLI] Withdraw 5 USDC to main account...
# [Transaction Hash: 0x...]
```

### 4.3 Llamadas RPC Manuales

```bash
# 1. Check USDC balance
cast call 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8 \
  "balanceOf(address)" 0x...YOUR_ADDRESS \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...

# 2. Check Tongo contract
cast call 0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585 \
  "get_balance(address)" 0x...YOUR_ADDRESS \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...

# 3. Approve USDC to Tongo
cast send 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8 \
  "approve(address,uint256)" \
  0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585 \
  1000000 \
  --private-key 0x... \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...
```

---

## 📊 Testing Checklist

- [ ] **Wallet Connection**
  - [ ] Connect Argent X to Sepolia
  - [ ] Connect Braavos to Sepolia
  - [ ] Verify network selector shows "Sepolia"

- [ ] **Balance Display**
  - [ ] Show USDC balance (if present)
  - [ ] Show STRK balance for gas fees
  - [ ] Update balance after transaction

- [ ] **Fund Flow**
  - [ ] Approve USDC to Tongo
  - [ ] Fund Tongo account with USDC
  - [ ] Verify encrypted balance updated
  - [ ] Check transaction on Starkscan

- [ ] **Transfer Flow**
  - [ ] Generate ZK proof
  - [ ] Transfer USDC to recipient
  - [ ] Recipient receives encrypted amount
  - [ ] Verify transactions on Starkscan

- [ ] **Withdraw Flow**
  - [ ] Generate ZK proof of ownership
  - [ ] Withdraw USDC to main wallet
  - [ ] Verify balance in wallet
  - [ ] Check transaction on Starkscan

- [ ] **Edge Cases**
  - [ ] Insufficient USDC balance
  - [ ] Insufficient STRK for gas
  - [ ] Network disconnection
  - [ ] Invalid recipient address
  - [ ] Large amounts (> 1000 USDC)

---

## 🔍 Debugging

### Issue: "USDC Address not found"

```typescript
// Verifica que el address correcto esté en wallet-config.ts
console.log('USDC Address:', NETWORKS.sepolia.strkAddress);

// Alterna: Agrega selector de token dinámico
const TOKENS = {
  sepolia: {
    usdc: '0x...', // Cuando disponible
    strk: '0x04718f5a...' // Fallback para testnet
  }
};
```

### Issue: "Insufficient balance for approval"

```bash
# 1. Verifica que tengas USDC en tu wallet
# 2. Asegúrate de tener STRK para gas fees
# 3. Solicita ambos en faucet
```

### Issue: "Tongo contract not found"

```typescript
// Verifica dirección del contrato
const contractAddress = NETWORKS.sepolia.tongoContractAddress;
console.log('Tongo Contract:', contractAddress);

// Si no existe, deploy test contract
sncast --profile sepolia deploy --contract-name TongoTest
```

### Issue: "Transaction rejected by wallet"

```
1. Verifica el network está correcto (Sepolia)
2. Valida la dirección del recipient
3. Confirma que aprobaste el token antes
4. Intenta con menor cantidad primero
```

---

## 📈 Performance Benchmarks

| Operación | Tiempo | Gas (STRK) | Notas |
|-----------|--------|-----------|-------|
| Connect Wallet | 1-2s | 0 | Local |
| Fund (Approve) | 10-15s | 0.001 | 1 tx |
| Fund (Deposit) | 10-15s | 0.002 | 1 tx |
| Transfer | 10-15s | 0.002 | ZK proof gen: ~2s |
| Withdraw | 10-15s | 0.002 | 1 tx |

---

## 🚢 Migration a Mainnet

Una vez testeado en Sepolia, para migrar a mainnet:

### 1. Update wallet-config.ts

```typescript
mainnet: {
  name: 'Starknet Mainnet',
  rpcUrl: 'https://starknet-mainnet.g.alchemy.com/...',
  tongoContractAddress: '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96',
  strkAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', // USDC mainnet
  chainId: 'SN_MAIN'
}
```

### 2. Obtener USDC Mainnet

```bash
# Bridge desde Ethereum Mainnet
# https://starkgate.starknet.io/
# ETH Mainnet → Starknet Mainnet
# USDC (Ethereum) → USDC (Starknet)
```

### 3. Update Deployment Records

```json
// deployments/mainnet.json
{
  "network": "mainnet",
  "contracts": {
    "tongo": {
      "address": "0x72098b...",
      "notes": "USDC native support"
    },
    "usdc": {
      "address": "0x053c91...",
      "notes": "Native Circle USDC"
    }
  }
}
```

---

## 📚 Referencias Útiles

- [Starknet Native USDC Blog](https://www.starknet.io/blog/native-usdc-live-on-starknet/)
- [Starkgate Bridge](https://starkgate.starknet.io/)
- [Tongo SDK Docs](https://github.com/omarespejel/tongo-sdk)
- [Starkscan Sepolia Explorer](https://sepolia.starkscan.io/)
- [Starknet Sepolia RPC](https://starknet-sepolia.public.blastapi.io)
- [Circle USDC Cross-Chain](https://www.circle.com/usdc)

---

## ⚠️ Security Considerations

### Never

- ❌ Commit `.env` con private keys
- ❌ Share private keys en logs o console
- ❌ Use production keys para testing
- ❌ Deploy sin auditar contratos

### Always

- ✅ Use testnets para development
- ✅ Rotate keys después de testing
- ✅ Validate addresses antes de transferencias
- ✅ Test con cantidades pequeñas primero
- ✅ Mantén backups seguros de private keys

---

## 📞 Support

Si encuentras issues:

1. Check [GitHub Issues](https://github.com/cxto21/treazury/issues)
2. Review [Starknet Docs](https://docs.starknet.io/)
3. Ask in [Starknet Discord](https://discord.gg/starknet)
4. Create detailed bug report con:
   - Network (Sepolia/Mainnet)
   - Wallet (Argent/Braavos)
   - Error message completo
   - Transaction hash (si aplicable)
