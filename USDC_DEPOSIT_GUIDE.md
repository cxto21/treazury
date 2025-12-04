# 🪙 Depositar USDC en Testnet - Guía Completa

## 📋 Resumen Rápido

Para probar Treazury con USDC en testnet necesitas:

1. **Obtener ETH en Ethereum Sepolia** (faucet)
2. **Intercambiar ETH → USDC** en Ethereum
3. **Puente USDC a Starknet Sepolia** (Starkgate)
4. **Depositar USDC en Tongo** (mediante Treazury UI)

**Tiempo total: ~30 minutos**

---

## 🚀 Paso 1: Obtener ETH en Ethereum Sepolia

### ¿Qué es Ethereum Sepolia?
- Red de prueba **SEPARADA** de Starknet
- Necesitas ETH aquí para pagar gas en Ethereum
- No confundir con Starknet

### Opción A: Alchemy Faucet (Recomendado)

1. Ir a https://sepoliafaucet.com
2. Conectar wallet (Argent X, Braavos, MetaMask)
3. **⚠️ CAMBIAR A ETHEREUM SEPOLIA EN LA WALLET**
4. Hacer clic en "Send me ETH"
5. Recibir 0.5 ETH en ~1 minuto

### Opción B: Google Cloud Faucet

1. Ir a https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Ingresar dirección Ethereum
3. Recibir 0.5 ETH

### ✅ Verificar

En tu wallet en **Ethereum Sepolia**, deberías ver:
```
Balance: 0.5 ETH
Network: Ethereum Sepolia
```

---

## 💱 Paso 2: Intercambiar ETH → USDC en Ethereum Sepolia

### En Uniswap

1. Ir a https://app.uniswap.org
2. **Verificar que dice "Ethereum Sepolia"** en selector de red
3. Conectar wallet
4. Intercambiar:
   - De: 0.1 ETH
   - A: USDC
5. Hacer clic en "Swap"
6. Confirmar en wallet
7. Esperar ~1 minuto

### ¿Cuánto USDC recibiré?

```
0.1 ETH ≈ 20-30 USDC (depende del precio)
```

### ✅ Verificar

En tu wallet en **Ethereum Sepolia**, deberías ver:
```
Balance: ~0.4 ETH, ~20 USDC
Network: Ethereum Sepolia
```

### Opción: Mint USDC Directamente

Si prefieres no intercambiar, puedes "minar" USDC testnet:

1. Ir a https://sepolia.etherscan.io/token/0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
2. Hacer clic en "Write Contract"
3. Conectar wallet
4. Llamar función `mint()` (con tu dirección)
5. Recibir USDC testnet

---

## 🌉 Paso 3: Puente USDC a Starknet Sepolia

### Usar Starkgate (Oficial)

1. Ir a https://starkgate.starknet.io/
2. Conectar wallet (verifica que esté en **Ethereum Sepolia**)
3. Seleccionar:
   - Origen: "Ethereum Sepolia"
   - Destino: "Starknet Sepolia"
   - Token: "USDC"
4. Ingresar cantidad (recomendado: 10 USDC mínimo)
5. Hacer clic en "Bridge"
6. Confirmar en wallet
7. **ESPERAR 5-10 MINUTOS** ⏳

### Durante el Puente

```
Status: "Bridging in progress"
Estimado: 5-10 minutos
```

No cerres la pestaña.

### ✅ Después del Puente

En tu wallet en **Starknet Sepolia**, deberías ver:
```
Balance: 10 USDC
Network: Starknet Sepolia
```

---

## 🔗 Paso 4: Depositar en Tongo mediante Treazury

### Usar la UI de Treazury

1. Abrir http://localhost:3000 (o tu instancia de Treazury)
2. Conectar wallet → "Starknet Sepolia"
3. Verificar balance USDC (debe mostrar ~10 USDC)
4. Hacer clic en "💰 Deposit USDC"
5. Ingresar cantidad (ej: 5 USDC)
6. Hacer clic en "💳 Deposit to Tongo"
7. **IMPORTANTE: Completar KYC primero** (si no está verificado)
8. Confirmar en wallet:
   - Aprobación (approve)
   - Depósito (transfer)
9. Esperar confirmación (~1-2 minutos)

### Panel de Progreso

Verás 4 pasos:
```
✅ Verificar Balance
   ↓
⏳ Aprobar USDC
   ↓
⏳ Depositar en Tongo
   ↓
⏳ Verificar Depósito
```

### ✅ Después del Depósito

```
✅ Balance actualizado
✅ Fondos en Tongo (encriptados)
✅ Listo para transferencias privadas
```

---

## 🔧 Solución de Problemas

### ❌ Error: "Insufficient Balance"

**Causa**: No tienes suficiente USDC
**Solución**: 
- Verifica el balance en wallet
- Inicia sesión en https://starkgate.starknet.io/ para ver estado del puente
- Espera confirmación si aún está en progreso

### ❌ Error: "Network Mismatch"

**Causa**: Wallet conectada a red incorrecta
**Solución**:
- En wallet, selecciona "Ethereum Sepolia" para intercambios
- En wallet, selecciona "Starknet Sepolia" para puente y Treazury
- Verifica selector de red en cada sitio

### ❌ Error: "KYC Required"

**Causa**: No has completado verificación de identidad
**Solución**:
- En Treazury, haz clic en "Verify Identity" o "Verify KYC"
- Sigue los pasos de verificación
- Espera confirmación (~1 minuto)
- Reintenta depositar

### ❌ El puente no aparece confirmado después de 15 minutos

**Causa**: Congestión o retraso en red
**Solución**:
- Espera más (hasta 30 minutos en ocasiones)
- Verifica hash en https://starkscan.co/
- Contacta soporte Starkgate si persiste

---

## 📊 Flujo Completo (Diagrama)

```
┌─ ETHEREUM SEPOLIA ───────────────────────────────┐
│                                                  │
│  1. Faucet → 0.5 ETH                            │
│     ↓                                            │
│  2. Uniswap → 0.1 ETH → 20 USDC                 │
│     ↓                                            │
│  3. Starkgate Bridge                            │
│     └──────────────────────────────────┐         │
│                                        │         │
└────────────────────────────────────────┼─────────┘
                                         │
                                   (5-10 min)
                                         │
                                         ↓
┌─ STARKNET SEPOLIA ───────────────────────────────┐
│                                                  │
│  4. Balance USDC                                 │
│     ↓                                            │
│  5. KYC Verification (si no hecho)               │
│     ↓                                            │
│  6. Treazury → Deposit USDC                      │
│     ├─ Approve (firma 1)                        │
│     ├─ Deposit (firma 2)                        │
│     └─ ✅ Fondos en Tongo                        │
│                                                  │
│  7. Listo para usar                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 💡 Tips Útiles

### Mantener Gas Fee en Reserve
```
Guardar ~0.05 ETH en Ethereum Sepolia para gas fees
Guardar ~0.01 STRK en Starknet Sepolia para gas fees
```

### Para Testnet

```
USDC en Ethereum Sepolia: 0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
USDC en Starknet Sepolia: 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
Tongo Sepolia: 0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
```

### Monitorear Transacciones

```
Ethereum: https://sepolia.etherscan.io
Starknet: https://starkscan.co (seleccionar Sepolia)
```

### Velocidad

| Paso | Tiempo |
|------|--------|
| Faucet | 1 min |
| Swap | 1 min |
| Bridge | 5-10 min |
| Deposito | 1-2 min |
| **Total** | **~20 min** |

---

## ✅ Checklist Final

- [ ] 0.5 ETH en Ethereum Sepolia
- [ ] ~20 USDC en Ethereum Sepolia
- [ ] 10 USDC en Starknet Sepolia (vía puente)
- [ ] Wallet conectada a Starknet Sepolia en Treazury
- [ ] Balance muestra USDC en Treazury
- [ ] KYC verificado (si necesario)
- [ ] Deposito completado exitosamente
- [ ] Fondos visibles en Tongo vault

---

## 🎉 ¡Listo!

Ya tienes USDC en Starknet Sepolia y puedes probar Treazury completamente.

### Próximos Pasos

- Transferencias privadas (Private Transfer)
- Lightning Network integration
- Donaciones anónimas
- Withdraw (retiro) de fondos

---

## 📞 Ayuda

Si tienes problemas:
1. Verifica el checklist arriba
2. Revisa el estado en Starkscan.co
3. Espera confirmación de puente (puede tomar 10 min)
4. Asegúrate de que network selector es correcto

¡Que disfrutes probando Treazury! 🚀
