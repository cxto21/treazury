// src/zkpassport-service.ts
// Servicio para gestionar pruebas KYC (ZKPassport) y verificación on-chain

import { RpcProvider } from 'starknet';
import { getContractAddress } from './deployments';

export class ZKPassportService {
  private provider: RpcProvider;
  private contractAddress: string;

  constructor(provider: RpcProvider, contractAddress?: string) {
    this.provider = provider;
    this.contractAddress = contractAddress || getContractAddress('sepolia', 'ZKPassportVerifier', '0x0') || '0x0';
  }

  async generateProof(kycLevel: number, subjectAddress: string): Promise<string[]> {
    // TODO: Integrar Noir/BB/Garaga; placeholder
    // Retorna array de valores en formato felt (números como strings)
    return [];
  }

  async verifyOnChain(fullProofWithHints: string[], kycLevel: number, subjectAddress: string): Promise<boolean> {
    if (this.contractAddress === '0x0') throw new Error('Verifier contract address not configured');
    // TODO: ABI y llamada reales cuando el contrato esté listo
    return false;
  }
}
