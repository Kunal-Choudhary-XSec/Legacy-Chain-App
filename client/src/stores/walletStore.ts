import { create } from "zustand";
import type { TransactionRecord, ContractEvent } from "@/types";

interface WalletState {
  // Wallet
  address: string;
  isConnected: boolean;
  network: string;
  balance: string;
  isConnecting: boolean;

  // Contract
  contractAddress: string;
  isOwner: boolean;
  isExecutor: boolean;
  isBeneficiary: boolean;

  // Transactions
  transactions: TransactionRecord[];

  // Events
  events: ContractEvent[];

  // Actions
  setAddress: (address: string) => void;
  setConnected: (connected: boolean) => void;
  setNetwork: (network: string) => void;
  setBalance: (balance: string) => void;
  setConnecting: (connecting: boolean) => void;
  setContractAddress: (address: string) => void;
  setRoles: (owner: boolean, executor: boolean, beneficiary: boolean) => void;
  addTransaction: (tx: TransactionRecord) => void;
  updateTransaction: (hash: string, updates: Partial<TransactionRecord>) => void;
  addEvent: (event: ContractEvent) => void;
  setEvents: (events: ContractEvent[]) => void;
  reset: () => void;
}

const initialState = {
  address: "",
  isConnected: false,
  network: "",
  balance: "0",
  isConnecting: false,
  contractAddress: "",
  isOwner: false,
  isExecutor: false,
  isBeneficiary: false,
  transactions: [] as TransactionRecord[],
  events: [] as ContractEvent[],
};

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,

  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  setNetwork: (network) => set({ network }),
  setBalance: (balance) => set({ balance }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setContractAddress: (contractAddress) => set({ contractAddress }),

  setRoles: (isOwner, isExecutor, isBeneficiary) =>
    set({ isOwner, isExecutor, isBeneficiary }),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 100),
    })),

  updateTransaction: (hash, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 200),
    })),

  setEvents: (events) => set({ events }),

  reset: () => set(initialState),
}));
