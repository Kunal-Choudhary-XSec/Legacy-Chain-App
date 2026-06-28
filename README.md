# Digital Inheritance

A decentralized will and inheritance system built on **Stellar Soroban**. Protect your digital assets by designating beneficiaries and executors who can inherit your crypto in the event of prolonged inactivity.

## How It Works

1. **Owner** creates the contract and sets an inactivity period (default: 30 days)
2. **Owner adds beneficiaries** (who gets what) and **executors** (who can trigger the process)
3. **Owner checks in periodically** to prove they're alive — this resets the inactivity timer
4. If the owner misses check-ins for the full inactivity period, an **executor can trigger inheritance**
5. The executor **confirms the distribution**, and beneficiaries **claim their allocation**

## Contract

| Detail | Value |
|---|---|
| Network | Stellar Testnet |
| Contract ID | `CCQ3FYUQ4F65Z4COZKXDGN6J5H4AMGVZO4RZAWYI2UOHKB7DCFU27FVE` |
| Explorer | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCQ3FYUQ4F65Z4COZKXDGN6J5H4AMGVZO4RZAWYI2UOHKB7DCFU27FVE) |

### Contract Functions

| Function | Auth | Description |
|---|---|---|
| `initialize` | Owner | Set owner and inactivity period |
| `check_in` | Owner | Reset the inactivity timer |
| `add_beneficiary` | Owner | Add a beneficiary with an amount |
| `remove_beneficiary` | Owner | Remove a beneficiary |
| `add_executor` | Owner | Add an executor |
| `remove_executor` | Owner | Remove an executor |
| `trigger_inheritance` | Executor | Start inheritance after inactivity |
| `confirm_distribution` | Executor | Finalize distribution for claims |
| `claim` | Beneficiary | Claim allocated amount |

## Project Structure

```
project/
├── contract/                  # Rust Soroban smart contract
│   ├── contracts/contract/
│   │   └── src/
│   │       ├── lib.rs         # Contract implementation
│   │       └── test.rs        # 12 passing tests
│   └── Cargo.toml
├── client/                    # Next.js 16 frontend
│   ├── src/
│   │   ├── app/               # Pages: Home, Dashboard, App, Activity, Transactions
│   │   ├── components/        # UI components (ContractUI, Navbar, etc.)
│   │   ├── hooks/             # Wallet & contract hooks (typed via bindings)
│   │   ├── lib/               # Stellar helpers, constants, utils
│   │   ├── stores/            # Zustand state management
│   │   └── types/             # TypeScript types
│   └── packages/contract/     # Auto-generated typed contract bindings
└── README.md
```

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Stellar Testnet, Soroban RPC
- **Wallet**: Freighter via StellarWalletsKit
- **State**: Zustand + TanStack Query

## Getting Started

### Prerequisites

- Rust toolchain with `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli)
- [Bun](https://bun.sh) (for frontend)
- Freighter wallet extension

### Run the Frontend

```bash
cd client
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

### Deploy the Contract

```bash
cd contract
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/digital_inheritance.wasm \
  --source-account dev \
  --network testnet
```

## License

MIT
