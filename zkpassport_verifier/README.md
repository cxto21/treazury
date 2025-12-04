# zkpassport_verifier (Cairo)

Interfaz y contrato base para verificación de KYC (ZKPassport) en Starknet.

## Objetivo
- Exponer `verify_kyc(full_proof_with_hints, kyc_level, subject_address) -> bool`.
- Integrar verificación con Garaga/Noir cuando el circuito y VK/Proof estén disponibles.

## Comandos
```bash
cd zkpassport_verifier
scarb build
```

## Próximos pasos
- Generar/verificar pruebas ZK (Noir/Barretenberg/Garaga) y cablearlas aquí.
- Añadir tests `snforge` cuando la lógica de verificación esté disponible.
