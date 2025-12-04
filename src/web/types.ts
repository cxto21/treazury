
// App State Management
export enum AppState {
  LOADING = 'LOADING',
  CONNECT_WALLET = 'CONNECT_WALLET',
  ACTIVE = 'ACTIVE'
}

// Theme
export type Theme = 'light' | 'dark';

// Wallet State
export interface WalletState {
  address: string;
  isConnected: boolean;
  balance: string;
}

// Transfer Form
export interface TransferFormState {
  amount: string;
  recipient: string;
}

// ZK Passport Steps
export enum ZKStep {
  SELECT_TYPE = 'SELECT_TYPE',
  SCANNING = 'SCANNING',
  GENERATING_PROOF = 'GENERATING_PROOF',
  VERIFYING_CONTRACT = 'VERIFYING_CONTRACT',
  SUCCESS = 'SUCCESS'
}

// Component Props
export interface LoadingGateProps {
  onComplete: () => void;
}

export interface ConnectWalletModalProps {
  onConnected: (address: string) => void;
}

export interface VaultInterfaceProps {
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
  walletAddress: string;
}

export interface ZKPassportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
