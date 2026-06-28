import {
  Address,
  Contract,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
  TransactionBuilder,
  BASE_FEE,
  Transaction,
  Account,
} from "@stellar/stellar-sdk";
import { RPC_URL, NETWORK_PASSPHRASE } from "./constants";

let _server: rpc.Server | null = null;

export function getServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(RPC_URL);
  }
  return _server;
}

export function getContract(contractId: string): Contract {
  return new Contract(contractId);
}

/** Dummy account for read-only simulations that don't need a real source. */
const DUMMY_ACCOUNT = new Account(
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  "0"
);

export function toScValString(val: string): xdr.ScVal {
  return nativeToScVal(val, { type: "string" });
}

export function toScValI128(val: string | number | bigint): xdr.ScVal {
  return nativeToScVal(val.toString(), { type: "i128" });
}

export function toScValU64(val: number): xdr.ScVal {
  return nativeToScVal(val, { type: "u64" });
}

export function toScValU32(val: number): xdr.ScVal {
  return nativeToScVal(val, { type: "u32" });
}

export function toScValAddress(val: string): xdr.ScVal {
  return new Address(val).toScVal();
}

export function toScValBool(val: boolean): xdr.ScVal {
  return xdr.ScVal.scvBool(val);
}

export function parseScVal(sv: xdr.ScVal): unknown {
  try {
    return scValToNative(sv);
  } catch {
    return null;
  }
}

export async function readContract(
  contractId: string,
  method: string,
  params: xdr.ScVal[] = [],
  source?: string
): Promise<unknown> {
  const server = getServer();
  const contract = getContract(contractId);

  const sourceAccount = source
    ? await server.getAccount(source)
    : DUMMY_ACCOUNT;

  const tx = new TransactionBuilder(sourceAccount, { fee: BASE_FEE })
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .setTimeout(30)
    .addOperation(contract.call(method, ...params))
    .build();

  const sim = await server.simulateTransaction(tx);

  if (
    rpc.Api.isSimulationError(sim) ||
    rpc.Api.isSimulationRestore(sim)
  ) {
    throw new Error(
      `Simulation error: ${JSON.stringify(sim)}`
    );
  }

  if (!sim.result) {
    throw new Error("No result from simulation");
  }

  return scValToNative(sim.result.retval);
}

export async function signAndSendTransaction(
  contractId: string,
  method: string,
  params: xdr.ScVal[],
  publicKey: string,
  signTx: (xdr: string) => Promise<string>
): Promise<{ hash: string; status: string }> {
  const server = getServer();
  const contract = getContract(contractId);

  const source = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(source, { fee: BASE_FEE })
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .setTimeout(30)
    .addOperation(contract.call(method, ...params))
    .build();

  // Simulate — required before sending to set footprint & auth
  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // Apply simulation results (footprint, auth, resource fees)
  const prepared = rpc.assembleTransaction(tx, sim)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  const signedXdr = await signTx(prepared.toXDR());
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "PENDING" || sendResponse.status === "DUPLICATE") {
    let txResult = await server.getTransaction(sendResponse.hash);
    let attempts = 0;
    while (txResult.status === "NOT_FOUND" && attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      txResult = await server.getTransaction(sendResponse.hash);
      attempts++;
    }

    return {
      hash: sendResponse.hash,
      status: txResult.status === "SUCCESS" ? "success" : "failed",
    };
  }

  throw new Error(`Transaction failed: ${sendResponse.errorResult?.result().switch().name || "Unknown error"}`);
}
