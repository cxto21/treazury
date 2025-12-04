# Checklist de Transformación (Resource2 → Treazury)

## Objetivo
Mapear archivo por archivo qué se trae/adapta del `starknet-privacy-toolkit` y cómo se integra en Treazury. Incorporar el Prototipo Frontend (Resource1) con rutas, UX y diseño cyberpunk.

## Núcleo ZK / Verificador
- donation_badge_verifier/
  - src/honk_verifier*.cairo → Referencia para patrón Garaga; crear verificador ZKPassport KYC.
  - src/badge_contract.cairo → Patrones de verificación/claim; reutilizar estructura para KYC.
  - Scarb.toml, snfoundry.toml → Base para proyecto Cairo de verificador.

## Circuitos Noir
- zk-badges/donation_badge → Referencia para pipeline Noir/bb/garaga; sustituir por circuito ZKPassport.
- generate-proof.sh → Adaptar a entradas KYC ZK y formato de calldata.

## Servicios TypeScript
- src/badge-service.ts → Patrón de llamada `claim_*`; adaptar a `verify_kyc`.
- src/tongo-service.ts → Base para flujo USDC con Tongo (fund/transfer/withdraw).
- src/config.ts, deployments/ → Gestionar RPC/addresses y registros de despliegue.
 - vite.config.ts → Confirmar configuración de build y alias; ajustar si es necesario para Cloudflare Pages.

## Scripts y Makefile
- scripts/*, Makefile, DEPENDENCIES.md → Instalar toolchain y verificar entorno.
 - DEPLOY.md / wrangler.toml → Incorporar/ajustar guía de despliegue en Cloudflare Pages y credenciales locales (sin secretos en repo).

## Pruebas
- /.Tests/
  - test_zkpassport_verifier.test.ts → Contrato Cairo de verificador KYC.
  - test_tongo_usdc.test.ts → Servicio Tongo USDC.
  - test_e2e_private_flow.test.ts → UI/servicio → backend → verificador.
  - test_security_thresholds.test.ts → Límites AML.

## Tareas de Integración (D2 detallado)

### Core ZK & Backend
- [ ] Cairo: cerrar ABI de verificación KYC (inputs públicos/privados necesarios) y retorno.
- [ ] Noir/Garaga: si aplica, definir circuito y generar/verificar prueba; alternativo: usar formato de prueba compatible existente.
- [x] TS: implementar `src/zkpassport-service.ts` con métodos `generateProof`, `verifyOnChain`.
- [ ] TS: adaptar `src/tongo-service.ts` para USDC privado (fund/transfer/withdraw) y exponer APIs.
- [ ] TS: actualizar `src/deployments.ts` y `deployments/<network>.json` con nuevas direcciones.
- [x] Frontend (Resource1): Componentes copiados (LoadingGate, VaultInterface, ZKPassportModal, ConnectWalletModal).
- [x] Frontend: App.tsx, types.ts, index.tsx integrados en `src/web/`.
- [x] Frontend: index.html con Tailwind CDN + estilos cyberpunk (neon, hexágon, animaciones).
- [x] Frontend: vite.config.ts actualizado para Cloudflare Pages + vars de entorno (STARKNET_RPC, ZKPASSPORT_CONTRACT).
- [x] Frontend: package.json actualizado con React + devDependencies de Vite.
- [x] Frontend: conectar formulario VaultInterface → zkpassport-service.ts → tongo-service.ts → contrato Cairo.
- [x] Build/Deploy: validar `vite.config.ts`, añadir pasos `bun run build:deploy`, y configurar Cloudflare Pages (Wrangler/CI).
- [x] snforge: scaffolding de tests Cairo creado en `zkpassport_verifier/tests`.
- [ ] Scripts: actualizar `scripts/verify.sh` para verificar estructura y dependencias.
- [x] Pruebas: escribir y ejecutar `/.Tests/` según D3 (esqueleto creado).

## Mapeo archivo por archivo (A→B)
- `donation_badge_verifier/src/*` → Referencia de verificador Garaga → crear `zkpassport_verifier/src/*` con lógica KYC.
- `zk-badges/donation_badge/*` → Pipeline Noir/bb → ajustar a KYC o desactivar si no aplica.
- `src/badge-service.ts` → Patrón `claim_badge` → `src/zkpassport-service.ts` con `verify_kyc`.
- `src/tongo-service.ts` → Retener y especializar a USDC; añadir helpers de flujo privado.
- `src/config.ts`/`vite.config.ts` → Confirmar envs y alias; compatibilidad Pages.
- `deployments/sepolia.json` → Agregar contratos Treazury (verificador KYC, servicios asociados).
- `scripts/setup.sh`/`verify.sh`/`uninstall.sh` → Validar toolchain y limpieza.
- `Makefile`/`DEPENDENCIES.md` → Incluir targets de verificación y build.
- [ ] E2E UI → backend → contrato.
- [ ] Build Vite exitoso y despliegue verificado en Cloudflare Pages.

## Progreso resumido
- D1: Documentación base creada y alineada (SRS, checklist, README_origin).
- D2: Verificador Cairo y servicio TS iniciados; Frontend Resource1 completamente integrado.
  - Componentes React (LoadingGate, VaultInterface, ZKPassportModal, ConnectWalletModal) copiados a `src/web/components/`.
  - Servicios frontend (src/web/services.ts) creados para conectar con zkpassport-service.ts y tongo-service.ts.
  - VaultInterface actualizado con manejo de errores, estados de éxito, y flujo ZK → verificación → transferencia privada.
  - vite.config.ts optimizado para Cloudflare Pages (outDir, build config, env vars).
  - package.json actualizado con React 19.2.1 y @vitejs/plugin-react.
  - index.html con Tailwind CDN, estilos cyberpunk (neon, hexágon, animaciones).
- D3: Estructura `/.Tests/` creada con casos esqueleto; Frontend UI/UX integration complete.
