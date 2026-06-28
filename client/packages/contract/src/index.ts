import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCQ3FYUQ4F65Z4COZKXDGN6J5H4AMGVZO4RZAWYI2UOHKB7DCFU27FVE",
  }
} as const

export type DataKey = {tag: "Owner", values: void} | {tag: "InactivityPeriod", values: void} | {tag: "LastCheckIn", values: void} | {tag: "Status", values: void} | {tag: "Beneficiaries", values: void} | {tag: "Executors", values: void} | {tag: "Claimed", values: void};

export interface Client {
  /**
   * Construct and simulate a claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Beneficiary claims their allocated amount.
   */
  claim: ({beneficiary}: {beneficiary: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  status: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a check_in transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Owner check-in: resets the inactivity timer.
   */
  check_in: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a executors transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  executors: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the inheritance contract with an owner and inactivity period (in seconds).
   */
  initialize: ({owner, inactivity_period}: {owner: string, inactivity_period: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a has_claimed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_claimed: ({addr}: {addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_inactive transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_inactive: (options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a add_executor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Owner adds an executor who can trigger the inheritance.
   */
  add_executor: ({owner, executor}: {owner: string, executor: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a beneficiaries transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  beneficiaries: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a last_check_in transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  last_check_in: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a add_beneficiary transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Owner adds a beneficiary with an amount.
   */
  add_beneficiary: ({owner, beneficiary, amount}: {owner: string, beneficiary: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a remove_executor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Owner removes an executor.
   */
  remove_executor: ({owner, executor}: {owner: string, executor: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a inactivity_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  inactivity_period: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a beneficiary_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  beneficiary_amount: ({addr}: {addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a remove_beneficiary transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Owner removes a beneficiary.
   */
  remove_beneficiary: ({owner, beneficiary}: {owner: string, beneficiary: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a trigger_inheritance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Executor triggers inheritance after inactivity period elapses.
   */
  trigger_inheritance: ({executor}: {executor: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a confirm_distribution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Executor confirms distribution, allowing beneficiaries to claim.
   */
  confirm_distribution: ({executor}: {executor: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAACpCZW5lZmljaWFyeSBjbGFpbXMgdGhlaXIgYWxsb2NhdGVkIGFtb3VudC4AAAAAAAVjbGFpbQAAAAAAAAEAAAAAAAAAC2JlbmVmaWNpYXJ5AAAAABMAAAAA",
        "AAAAAAAAAAAAAAAFb3duZXIAAAAAAAAAAAAAAQAAABM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABU93bmVyAAAAAAAAAAAAAAAAAAAQSW5hY3Rpdml0eVBlcmlvZAAAAAAAAAAAAAAAC0xhc3RDaGVja0luAAAAAAAAAAAAAAAABlN0YXR1cwAAAAAAAAAAAAAAAAANQmVuZWZpY2lhcmllcwAAAAAAAAAAAAAAAAAACUV4ZWN1dG9ycwAAAAAAAAAAAAAAAAAAB0NsYWltZWQA",
        "AAAAAAAAAAAAAAAGc3RhdHVzAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAACxPd25lciBjaGVjay1pbjogcmVzZXRzIHRoZSBpbmFjdGl2aXR5IHRpbWVyLgAAAAhjaGVja19pbgAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAJZXhlY3V0b3JzAAAAAAAAAAAAAAEAAAPqAAAAEw==",
        "AAAAAAAAAFVJbml0aWFsaXplIHRoZSBpbmhlcml0YW5jZSBjb250cmFjdCB3aXRoIGFuIG93bmVyIGFuZCBpbmFjdGl2aXR5IHBlcmlvZCAoaW4gc2Vjb25kcykuAAAAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAARaW5hY3Rpdml0eV9wZXJpb2QAAAAAAAAGAAAAAA==",
        "AAAAAAAAAAAAAAALaGFzX2NsYWltZWQAAAAAAQAAAAAAAAAEYWRkcgAAABMAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAALaXNfaW5hY3RpdmUAAAAAAAAAAAEAAAAB",
        "AAAAAAAAADdPd25lciBhZGRzIGFuIGV4ZWN1dG9yIHdobyBjYW4gdHJpZ2dlciB0aGUgaW5oZXJpdGFuY2UuAAAAAAxhZGRfZXhlY3V0b3IAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGV4ZWN1dG9yAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANYmVuZWZpY2lhcmllcwAAAAAAAAAAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAANbGFzdF9jaGVja19pbgAAAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAChPd25lciBhZGRzIGEgYmVuZWZpY2lhcnkgd2l0aCBhbiBhbW91bnQuAAAAD2FkZF9iZW5lZmljaWFyeQAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAC2JlbmVmaWNpYXJ5AAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAAAAABpPd25lciByZW1vdmVzIGFuIGV4ZWN1dG9yLgAAAAAAD3JlbW92ZV9leGVjdXRvcgAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGV4ZWN1dG9yAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAARaW5hY3Rpdml0eV9wZXJpb2QAAAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAAAAAAAASYmVuZWZpY2lhcnlfYW1vdW50AAAAAAABAAAAAAAAAARhZGRyAAAAEwAAAAEAAAAL",
        "AAAAAAAAABxPd25lciByZW1vdmVzIGEgYmVuZWZpY2lhcnkuAAAAEnJlbW92ZV9iZW5lZmljaWFyeQAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAtiZW5lZmljaWFyeQAAAAATAAAAAA==",
        "AAAAAAAAAD5FeGVjdXRvciB0cmlnZ2VycyBpbmhlcml0YW5jZSBhZnRlciBpbmFjdGl2aXR5IHBlcmlvZCBlbGFwc2VzLgAAAAAAE3RyaWdnZXJfaW5oZXJpdGFuY2UAAAAAAQAAAAAAAAAIZXhlY3V0b3IAAAATAAAAAA==",
        "AAAAAAAAAEBFeGVjdXRvciBjb25maXJtcyBkaXN0cmlidXRpb24sIGFsbG93aW5nIGJlbmVmaWNpYXJpZXMgdG8gY2xhaW0uAAAAFGNvbmZpcm1fZGlzdHJpYnV0aW9uAAAAAQAAAAAAAAAIZXhlY3V0b3IAAAATAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    claim: this.txFromJSON<null>,
        owner: this.txFromJSON<string>,
        status: this.txFromJSON<u32>,
        check_in: this.txFromJSON<null>,
        executors: this.txFromJSON<Array<string>>,
        initialize: this.txFromJSON<null>,
        has_claimed: this.txFromJSON<boolean>,
        is_inactive: this.txFromJSON<boolean>,
        add_executor: this.txFromJSON<null>,
        beneficiaries: this.txFromJSON<Array<string>>,
        last_check_in: this.txFromJSON<u64>,
        add_beneficiary: this.txFromJSON<null>,
        remove_executor: this.txFromJSON<null>,
        inactivity_period: this.txFromJSON<u64>,
        beneficiary_amount: this.txFromJSON<i128>,
        remove_beneficiary: this.txFromJSON<null>,
        trigger_inheritance: this.txFromJSON<null>,
        confirm_distribution: this.txFromJSON<null>
  }
}