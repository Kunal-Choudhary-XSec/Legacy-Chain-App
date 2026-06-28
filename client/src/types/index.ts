export interface WalletInfo {
  address: string;
  network: string;
  balance: string;
}

export interface Beneficiary {
  address: string;
  amount: string;
}

export interface ContractState {
  owner: string;
  status: number; // 0=Active, 1=Triggered, 2=Confirmed
  lastCheckIn: number;
  inactivityPeriod: number;
  beneficiaries: Beneficiary[];
  executors: string[];
  isInactive: boolean;
}

export interface ContractEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  txHash?: string;
}

export interface TransactionRecord {
  hash: string;
  status: "pending" | "success" | "failed";
  type: string;
  timestamp: number;
  message?: string;
}

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const STATUS_MAP: Record<number, string> = {
  0: "Active",
  1: "Triggered",
  2: "Confirmed",
};

export const STATUS_COLORS: Record<number, string> = {
  0: "text-green-500",
  1: "text-yellow-500",
  2: "text-blue-500",
};

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL = "https://soroban-testnet.stellar.org";
