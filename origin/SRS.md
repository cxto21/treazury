# Treazury — Security-First SRS (MoSCoW)

## Vision
Treazury es una bóveda de USDC con transferencias privadas en Starknet. Combina ZKPassport (KYC ZK), Tongo (saldo cifrado y pruebas ZK), y Noir/Garaga (STARK) con una UI móvil tipo cyberpunk.

## Alcance y Supuestos
- Entorno: Linux (Codespaces/DevContainer Ubuntu 24.04), Bun/Node, Starknet toolchain.
- Build/Frontend: Vite ya presente en el template; el despliegue objetivo es Cloudflare Pages.
- Redes: Sepolia (testnet) primero; Mainnet posteriormente.
- Privacidad: No expone montos; compromisos Poseidon sobre (monto, secreto).
- Seguridad: Claves nunca en repo; `.secrets` gitignored; RPC autenticado.

## Requisitos (MoSCoW)
### MUST
- ZKPassport: flujo frontend → backend que verifique prueba ZK en Cairo (verificador de KYC).
- Tongo USDC: integración para crear transferencia privada (fondos cifrados, pruebas ZK, envío).
- Pruebas: directorio `/.Tests/` con casos por archivo clave (contratos, servicios, e2e, límites AML).

### SHOULD
- UI prototipo: formulario de transferencia privada, estado de balance cifrado, generación de prueba.
- Registro de despliegues: `deployments/<network>.json` consumido por frontend.
- Pipeline de build y deploy: `vite build` y publicación en Cloudflare Pages (Wrangler/CI).

### COULD
- Automatización de fees STRK (estimación y provisión básica).
- API ligera para orquestar pruebas ZK en servidor (si WASM no es viable en navegador).

### WON'T
- Dashboard de analítica avanzada.
- Generación de pruebas pesadas en cliente en producción (se prefiere backend).

## Entregables
- `/origin/` documentación (SRS, checklist, README_origin).
- Integración de `starknet-privacy-toolkit` adaptada a Treazury.
- Contratos Cairo (ZKPassport KYC verificador + badge/verifier si se reutiliza).
- Servicios TypeScript para Tongo y pruebas ZK.
- Pruebas en `/.Tests/` pasando al 100%.
- Configuración de deploy: scripts `bun run build:deploy`/`vite build`, y guía/CI para Cloudflare Pages.

## Criterios de Aceptación
- Flujo e2e: generar/calcular compromiso, producir prueba, verificar en contrato, ejecutar transferencia privada Tongo.
- Pruebas unitarias/integración/e2e verdes.
- Seguridad: sin secretos en repo; validaciones de entrada; manejo de errores.

## Dependencias
- Noir, Barretenberg, Garaga, Scarb, Starknet Foundry, Starknet.js, Tongo SDK.
- Scripts/Makefile de `DEPENDENCIES.md` para instalación reproducible.

## Riesgos
- Incompatibilidad de versiones ZK (bb/Garaga/Noir).
- Costes de gas / latencia de prueba.
- Complejidad de KYC ZK (demostrativo vs producción).
