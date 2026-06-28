"use client";

import { useCallback, useEffect } from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { useWalletStore } from "@/stores/walletStore";
import { getServer } from "@/lib/stellar";
import { NETWORK_PASSPHRASE } from "@/lib/constants";

const KIT_NETWORKS: Record<string, Networks> = {
  "Test SDF Network ; September 2015": Networks.TESTNET,
  "Public Global Stellar Network ; September 2015": Networks.PUBLIC,
};

let initialized = false;

function ensureKit(): void {
  if (!initialized) {
    StellarWalletsKit.init({
      modules: [],
      network: KIT_NETWORKS[NETWORK_PASSPHRASE] || Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
    });
    initialized = true;
  }
}

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
      ensureKit();
      // Open the modal and wait for wallet selection
      const { address } = await StellarWalletsKit.authModal();
      const pubKey = address;

      store.setAddress(pubKey);
      store.setConnected(true);
      store.setNetwork("testnet");
      await getBalance(pubKey);
    } catch (err) {
      console.error("Connection error:", err);
      throw err;
    } finally {
      store.setConnecting(false);
    }
  }, [store, getBalance]);

  const disconnect = useCallback(() => {
    StellarWalletsKit.disconnect();
    store.reset();
  }, [store]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: store.address,
      });
      return signedTxXdr;
    },
    [store.address]
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
