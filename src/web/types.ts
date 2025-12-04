
export interface HexSegmentProps {
  rotation: number;
  delay: number;
}

export enum AppState {
  LOADING = 'LOADING',
  CONNECT_WALLET = 'CONNECT_WALLET',
  ACTIVE = 'ACTIVE'
}

export interface WalletState {
  address: string;
  balance: number;
  currency: string;
}

export interface TransferFormState {
  amount: string;
  recipient: string;
}

export type Theme = 'light' | 'dark';

export enum ZKStep {
  IDLE = 'IDLE',
  SELECT_TYPE = 'SELECT_TYPE',
  SCANNING = 'SCANNING',
  GENERATING_PROOF = 'GENERATING_PROOF',
  VERIFYING_CONTRACT = 'VERIFYING_CONTRACT',
  SUCCESS = 'SUCCESS'
}
