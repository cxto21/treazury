# Treazury — Arquitectura Security-First (Origen)

## Propósito
Establecer la base documental y técnica para transformar el `starknet-privacy-toolkit` en un sistema Treazury E2E con KYC ZK + Tongo USDC + Noir/Garaga.

## Componentes
- Verificador Cairo (ZKPassport KYC) inspirado en patrones Garaga del toolkit.
- Servicios TS para Tongo (USDC privado) y verificación ZK.
- UI móvil minimalista para transferencias privadas y estado cifrado.
- Scripts/Makefile para instalación reproducible (ver `DEPENDENCIES.md`).
 - Build y Deploy: Vite para build del frontend; objetivo de despliegue en Cloudflare Pages.

## Flujo de Alto Nivel
1. Usuario conecta wallet (Argent/Braavos) y carga UI.
2. Genera prueba ZK de KYC (o la recupera) → backend valida vía contrato verificador.
3. Tongo cifra saldo y genera prueba de transferencia; se envía operación privada.
4. Se registra metadato público mínimo (eventos), manteniendo montos privados.
 5. El frontend se construye con Vite y se despliega en Cloudflare Pages mediante Wrangler/CI.

## Etapas (D1–D4)
- D1: Crear `/origin/` con SRS, checklist, README origen.
- D2: Checklist AI para transformar A→B (archivo por archivo).
- D3: Plan de pruebas en `/.Tests/` con casos por archivo.
- D4: Implementación exhaustiva hasta pasar 100% de pruebas.

## Seguridad
- Sin secretos en repo; `.secrets` fuera de control de versiones.
- Validaciones estrictas de entradas y manejo de errores.
- Versiones ZK fijadas (Noir/BB/Garaga) para compatibilidad.

## Próximos pasos
- Inicializar proyecto Cairo `zkpassport_verifier`.
- Definir endpoints y servicios para pruebas ZK.
- Integrar Tongo USDC en frontend/backend.
 - Verificar `vite.config.ts` y preparar `DEPLOY.md`/`wrangler.toml` para Cloudflare Pages.
