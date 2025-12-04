# USDC Testnet - Quick Start Guide

## 🎯 Lo que necesitas hacer EN 5 MINUTOS

### Fase 1: Setup (2 min)

```bash
# 1. Crea wallet en Sepolia (si no tienes)
# → https://www.argent.xyz o https://www.braavos.app/

# 2. Obtén ETH en Sepolia
# → https://sepoliafaucet.com

# 3. Swapea ETH → USDC en Uniswap Sepolia
# → https://app.uniswap.org (cambiar a Sepolia testnet)

# 4. Bridge USDC a Starknet Sepolia
# → https://starkgate.starknet.io/
# Select: Ethereum Sepolia → Starknet Sepolia
```

### Fase 2: Testing (3 min)

```bash
# 1. Inicia Treazury
bun run dev:web

# 2. Abre http://localhost:3000

# 3. Connect wallet → Argent X o Braavos

# 4. Verifica que ves USDC en el balance

# 5. Prueba el Fund flow:
#    Click "Fund" → "Approve USDC" → Confirmar en wallet
#    Click "Fund again" → Confirmar en wallet
#    Ver transacción en Starkscan Sepolia
```

---

## 📊 ¿QUÉ BUSCAR EN CADA PANTALLA?

### Pantalla Principal

```
┌─────────────────────────────────────┐
│  Connected: Your Address            │
│  Network: Starknet Sepolia ✓        │
│  Balance: 10 USDC                   │
└─────────────────────────────────────┘
```

**✅ Verde = Correcto**
- Red selection: "Sepolia Testnet"
- Balance muestra número (cualquier cantidad de USDC)
- Status dice "Connected"

### Tongo Card

```
┌─────────────────────────────────────┐
│  💰 Private Fund (Tongo)            │
│                                     │
│  Available: 10 USDC                 │
│  [Fund]      [Transfer]  [Withdraw] │
│                                     │
│  Status: Ready                      │
└─────────────────────────────────────┘
```

**✅ Verde = Correcto**
- Buttons habilitados (no grayed out)
- Status dice "Ready"
- Available amount es positivo

---

## 🔄 FLUJO PASO A PASO

### Flow 1: FUND (Depósito)

```
1. Click [Fund] button
   ↓
2. Ingresa "10" (o cualquier cantidad)
   ↓
3. Click "Approve USDC"
   ↓
4. Wallet extension popup
   → Click "Approve"
   ↓
5. Espera 20-30 segundos
   ↓
6. Click "Fund" nuevamente
   ↓
7. Wallet extension popup
   → Click "Confirm"
   ↓
8. Espera 30-60 segundos
   ↓
✅ Ver "Fund successful!"
   → Tx Hash: 0x...
```

**Verificar en Starkscan:**
```
https://sepolia.starkscan.io/

1. Busca tu wallet address (arriba derecha)
2. Deberías ver:
   - 1 tx de Approval (USDC approve)
   - 1 tx de Fund (Tongo.fund call)
3. Click en cada una para detalles
```

---

### Flow 2: TRANSFER (Transferencia encriptada)

```
1. Click [Transfer] button
   ↓
2. Ingresa recipient address (otra wallet Sepolia)
   ↓
3. Ingresa cantidad (ej: 5 USDC)
   ↓
4. Click "Transfer"
   ↓
5. Wallet extension popup
   → Click "Confirm"
   ↓
6. Espera 30-60 segundos
   ↓
✅ Ver "Transfer successful!"
   → Tx Hash: 0x...
   → 5 USDC enviados de forma encriptada
```

**Nota:** El recipient NO VE el monto en cadena (encriptado con Tongo)

---

### Flow 3: WITHDRAW (Retiro)

```
1. Click [Withdraw] button
   ↓
2. Ingresa cantidad (ej: 5 USDC)
   ↓
3. Click "Withdraw"
   ↓
4. Wallet extension popup
   → Click "Confirm"
   ↓
5. Espera 30-60 segundos
   ↓
✅ Ver "Withdraw successful!"
   → Tx Hash: 0x...
   → 5 USDC enviados a tu wallet
```

**Verificar:** Chequea el balance en tu wallet después

---

## 🐛 TROUBLESHOOTING RÁPIDO

### ❌ "No USDC balance"

**Solución:**
1. ¿Bridgeaste USDC a Starknet Sepolia?
   → Si no: Haz bridge desde Ethereum Sepolia
2. ¿Está tu wallet conectada?
   → Click [Connect] nuevamente
3. ¿Estás en Sepolia?
   → Switch a "Starknet Sepolia" en selector

---

### ❌ "Insufficient STRK for gas"

**Solución:**
1. Necesitas STRK para pagar gas fees
2. Obtén STRK en https://www.starkgate.io/
   O solicita en Starknet faucet
3. Mínimo recomendado: 0.01 STRK

---

### ❌ "Approve failed"

**Solución:**
1. Verifica que tienes USDC balance
2. Chequea que tienes STRK para gas
3. Intenta nuevamente
4. Si persiste: Revisit USDC_TESTNET_GUIDE.md

---

### ❌ "Transfer/Fund times out"

**Solución:**
1. Espera unos minutos más
2. Chequea en Starkscan si la tx se envió
3. Si no aparece: Intenta con cantidad menor
4. Revisa que no haya network issues

---

## ✅ ÉXITO = QUÉ SIGNIFICA

```
✅ TODO está funcionando si ves:

1. Wallet conectada a Sepolia
2. USDC balance visible
3. Tongo card con status "Ready"
4. Puedes ejecutar Fund
5. Transacción aparece en Starkscan
6. Balance se actualiza después
7. Puedes hacer Transfer
8. Puedes hacer Withdraw
9. Todos los balances cuadran
```

---

## 📊 CHECKPOINTS

Marca conforme completes:

- [ ] Wallet conectada a Sepolia
- [ ] Tengo USDC balance
- [ ] Tengo STRK para gas
- [ ] Ví el Fund flow completo
- [ ] Transacción en Starkscan
- [ ] Transfer funcionó
- [ ] Withdraw funcionó
- [ ] Todos los balances correctos

---

## 🎬 SIGUIENTE PASO

Cuando TODO funcione:

```bash
# 1. Documenta qué funcionó/qué falló
# 2. Crea issue/pull request en GitHub
# 3. Comparte logs y tx hashes si hay problemas

# La info que necesitamos:
- Network (Sepolia)
- Wallet (Argent X / Braavos)
- Transacciones que ejecutaste
- Errors específicos (si los hay)
- Screenshots del flow
```

---

## 🚀 PRÓXIMO: MAINNET

Cuando Sepolia esté 100% funcionando:

```bash
# 1. Switch a Mainnet
# 2. Bridge USDC real desde Ethereum Mainnet
# 3. Repite todos los tests
# 4. Monitorea costos de gas reales

⚠️ MAINNET = REAL MONEY
   Testa con cantidades PEQUEÑAS primero
```

---

## 📞 AYUDA

Si algo no funciona:

1. **Lee los logs en console** (`F12` → Console tab)
2. **Busca en USDC_TESTNET_GUIDE.md**
3. **Check Starkscan** para ver si la tx llegó
4. **Reinicia el servidor** (`bun run dev:web`)
5. **Ask en Starknet Discord**

---

⏱️ **Tiempo total:** ~5 minutos para setup + 5 minutos por flow = 15 minutos total

¡Listo para testear! 🚀
