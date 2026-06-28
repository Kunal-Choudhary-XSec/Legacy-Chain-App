import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export function formatRelativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function explorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function parseContractError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("HostError")) {
      const match = msg.match(/Error\(Contract, #(\d+)\)/);
      if (match) {
        const code = parseInt(match[1]);
        const errors: Record<number, string> = {
          1: "Already initialized",
          2: "Not authorized",
          3: "Already a beneficiary",
          4: "Not a beneficiary",
          5: "Already claimed",
          6: "Inactivity period not elapsed",
          7: "Already triggered",
          8: "Distribution not confirmed",
        };
        return errors[code] || `Contract error #${code}`;
      }
      return "Contract execution failed";
    }
    if (msg.includes("wallet not found") || msg.includes("Freighter")) {
      return "Wallet not found. Please install Freighter extension.";
    }
    if (msg.includes("User rejected") || msg.includes("cancel")) {
      return "Transaction was rejected by user.";
    }
    if (msg.includes("insufficient") || msg.includes("balance")) {
      return "Insufficient balance for transaction.";
    }
    return msg;
  }
  return "An unknown error occurred";
}
