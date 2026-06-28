"use client";

import { useCallback, useEffect } from "react";
import freighter from "@stellar/freighter-api";
import { useWalletStore } from "@/stores/walletStore";
import { getServer } from "@/lib/stellar";
import { NETWORK_PASSPHRASE } from "@/lib/constants";

export function useWallet() {
  const store = useWalletStore();

  const getBalance = useCallback(async (address: string) => {
    try {
      const server = getServer();
      const account = await server.getAccount(address);
      const accountData = account as unknown as { balances: Array<{ asset_type: string; balance: string }> };
      const balance =
        accountData.balances.find(
          (b) => b.asset_type === "native"
        )?.balance || "0";
      store.setBalance(balance);
    } catch {
      store.setBalance("0");
    }
  }, [store]);

  const connect = useCallback(async () => {
    store.setConnecting(true);
    try {
      // Check if Freighter is installed
      const { isConnected } = await freighter.isConnected();
      if (!isConnected) {
        throw new Error(
          "Freighter wallet not detected. Please install the Freighter browser extension."
        );
      }

      // Request access and get the address
      const { address, error } = await freighter.requestAccess();
      if (error || !address) {
        throw new Error(error?.message || "Failed to connect to Freighter");
      }

      // Verify the network matches
      const { networkPassphrase } = await freighter.getNetwork();
      if (networkPassphrase !== NETWORK_PASSPHRASE) {
        console.warn(
          `Network mismatch: Freighter is on "${networkPassphrase}", app expects "${NETWORK_PASSPHRASE}"`
        );
      }

      store.setAddress(address);
      store.setConnected(true);
      store.setNetwork("testnet");
      await getBalance(address);
    } catch (err) {
      console.error("Connection error:", err);
      throw err;
    } finally {
      store.setConnecting(false);
    }
  }, [store, getBalance]);

  const disconnect = useCallback(() => {
    store.reset();
  }, [store]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const { signedTxXdr, error } = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if (error || !signedTxXdr) {
        throw new Error(error?.message || "Failed to sign transaction");
      }
      return signedTxXdr;
    },
    []
  );

  useEffect(() => {
    if (store.address) {
      getBalance(store.address);
      const interval = setInterval(() => {
        getBalance(store.address);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [store.address, getBalance]);

  return {
    ...store,
    connect,
    disconnect,
    signTransaction,
    getBalance,
  };
}