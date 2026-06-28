"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import type { Beneficiary, ContractState } from "@/types";

// Import the generated type-safe Client from the contract bindings
import { Client as ContractClient, networks } from "contract";

let _client: ContractClient | null = null;
function getContractClient(): ContractClient {
  if (!_client) {
    _client = new ContractClient({
      contractId: networks.testnet.contractId,
      networkPassphrase: networks.testnet.networkPassphrase,
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
    });
  }
  return _client;
}

/**
 * Wrap a Freighter-style signTransaction (returns string) into the SDK's SignTransaction type (returns { signedTxXdr }).
 */
function wrapSigner(signer: (xdr: string) => Promise<string>): (xdr: string) => Promise<{ signedTxXdr: string }> {
  return async (xdr: string) => {
    const signedTxXdr = await signer(xdr);
    return { signedTxXdr };
  };
}

/**
 * Sign and send an AssembledTransaction, track it in the store.
 * `signAndSend` already handles polling internally via `SentTransaction`.
 */
async function signAndTrack(
  txPromise: Promise<any>,
  txType: string,
  store: ReturnType<typeof useWalletStore.getState>,
  signTransaction: (xdr: string) => Promise<string>,
  refreshState: () => Promise<void>
) {
  const assembled = await txPromise;
  const sent = await assembled.signAndSend({
    signTransaction: wrapSigner(signTransaction),
  });

  const hash = sent.sendTransactionResponse?.hash || "unknown";
  const finalStatus = sent.getTransactionResponse?.status === "SUCCESS" ? "success" : "failed";

  store.addTransaction({
    hash,
    status: finalStatus,
    type: txType,
    timestamp: Math.floor(Date.now() / 1000),
  });

  await refreshState();
  return { hash, status: finalStatus };
}

export function useContract(signTransaction?: (xdr: string) => Promise<string>) {
  const store = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ContractState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getContractState = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return null;
    try {
      const client = getContractClient();

      const [ownerTx, statusTx, lastCheckInTx, periodTx, beneficiaryAddrsTx, executorAddrsTx, isInactiveTx] =
        await Promise.all([
          client.owner(),
          client.status(),
          client.last_check_in(),
          client.inactivity_period(),
          client.beneficiaries(),
          client.executors(),
          client.is_inactive(),
        ]);

      const owner = ownerTx.result;
      const status = statusTx.result;
      const lastCheckIn = lastCheckInTx.result;
      const period = periodTx.result;
      const beneficiaryAddrs = beneficiaryAddrsTx.result;
      const executorAddrs = executorAddrsTx.result;
      const isInactive = isInactiveTx.result;

      // Get amounts for each beneficiary
      const beneficiaries: Beneficiary[] = [];
      for (const addr of beneficiaryAddrs) {
        try {
          const amountTx = await client.beneficiary_amount({ addr });
          beneficiaries.push({ address: addr, amount: amountTx.result.toString() });
        } catch {
          beneficiaries.push({ address: addr, amount: "0" });
        }
      }

      return {
        owner,
        status: Number(status),
        lastCheckIn: Number(lastCheckIn),
        inactivityPeriod: Number(period),
        beneficiaries,
        executors: executorAddrs,
        isInactive,
      } as ContractState;
    } catch (err) {
      console.error("Failed to fetch contract state:", err);
      return null;
    }
  }, []);

  const refreshState = useCallback(async () => {
    const s = await getContractState();
    if (s) {
      setState(s);
      const addr = store.address;
      store.setRoles(
        s.owner === addr,
        s.executors.includes(addr),
        s.beneficiaries.some((b) => b.address === addr)
      );
    }
  }, [getContractState, store]);

  // Poll for state changes
  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const requireWallet = useCallback(() => {
    if (!store.isConnected || !store.address) {
      throw new Error("Please connect your wallet first");
    }
  }, [store]);

  const requireSigner = useCallback(() => {
    if (!signTransaction) {
      throw new Error("Sign transaction function not available. Connect wallet first.");
    }
  }, [signTransaction]);

  const execClientTx = useCallback(
    async <T>(
      fn: (client: ContractClient) => Promise<any>,
      txType: string
    ): Promise<any> => {
      requireWallet();
      requireSigner();
      if (!CONTRACT_ADDRESS) throw new Error("Contract not deployed");
      setLoading(true);
      setError(null);
      try {
        const client = getContractClient();
        const txPromise = fn(client);
        const result = await signAndTrack(txPromise, txType, store, signTransaction!, refreshState);
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [requireWallet, requireSigner, store, refreshState]
  );

  const checkin = useCallback(async () => {
    const addr = store.address;
    return execClientTx((c) => c.check_in({ owner: addr }), "Check In");
  }, [execClientTx, store.address]);

  const addBeneficiary = useCallback(
    async (beneficiaryAddr: string, amount: string) => {
      const addr = store.address;
      return execClientTx(
        (c) => c.add_beneficiary({ owner: addr, beneficiary: beneficiaryAddr, amount: BigInt(amount) }),
        "Add Beneficiary"
      );
    },
    [execClientTx, store.address]
  );

  const removeBeneficiary = useCallback(
    async (beneficiaryAddr: string) => {
      const addr = store.address;
      return execClientTx(
        (c) => c.remove_beneficiary({ owner: addr, beneficiary: beneficiaryAddr }),
        "Remove Beneficiary"
      );
    },
    [execClientTx, store.address]
  );

  const addExecutor = useCallback(
    async (executorAddr: string) => {
      const addr = store.address;
      return execClientTx(
        (c) => c.add_executor({ owner: addr, executor: executorAddr }),
        "Add Executor"
      );
    },
    [execClientTx, store.address]
  );

  const removeExecutor = useCallback(
    async (executorAddr: string) => {
      const addr = store.address;
      return execClientTx(
        (c) => c.remove_executor({ owner: addr, executor: executorAddr }),
        "Remove Executor"
      );
    },
    [execClientTx, store.address]
  );

  const triggerInheritance = useCallback(async () => {
    const addr = store.address;
    return execClientTx(
      (c) => c.trigger_inheritance({ executor: addr }),
      "Trigger Inheritance"
    );
  }, [execClientTx, store.address]);

  const confirmDistribution = useCallback(async () => {
    const addr = store.address;
    return execClientTx(
      (c) => c.confirm_distribution({ executor: addr }),
      "Confirm Distribution"
    );
  }, [execClientTx, store.address]);

  const claim = useCallback(async () => {
    const addr = store.address;
    return execClientTx((c) => c.claim({ beneficiary: addr }), "Claim");
  }, [execClientTx, store.address]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state,
    loading,
    error,
    clearError,
    refreshState,
    checkin,
    addBeneficiary,
    removeBeneficiary,
    addExecutor,
    removeExecutor,
    triggerInheritance,
    confirmDistribution,
    claim,
  };
}
