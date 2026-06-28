# Digital Inheritance — Stellar Soroban

A decentralized digital inheritance smart contract built on **Stellar Soroban** that automatically transfers assets to beneficiaries when the owner becomes inactive, with executor verification and confirmation.

## Overview

This project implements a complete **digital inheritance** system with:

- **Soroban Smart Contract** — Handles owner check-ins, beneficiary whitelist management, executor designation, inactivity detection, inheritance triggering, and claims processing.
- **Next.js Frontend** — React-based UI with wallet integration, real-time updates, transaction tracking, and event feed.
- **Stellar Integration** — Deployed on Stellar Testnet with full Soroban SDK support.

### How It Works

1. **Owner Setup** — The contract owner configures an inactivity period (in seconds), adds beneficiaries with asset allocations, and designates trusted executors.
2. **Active Monitoring** — The owner periodically calls `check_in` to prove they are alive. If the owner stops checking in past the configured period, the contract marks them as inactive.
3. **Executor Trigger** — A designated executor detects the inactivity and calls `trigger_inheritance` to start the inheritance process.
4. **Executor Confirmation** — The executor confirms the distribution via `confirm_distribution`.
5. **Beneficiary Claim** — Beneficiaries can then call `claim` to receive their allocated amounts.

## Features

- ✅ **Soroban Smart Contract** — Custom digital inheritance logic on Stellar
- ✅ **Beneficiary Whitelist** — Owner can add/remove beneficiaries with specific allocations
- ✅ **Executor System** — Designated executors verify and confirm the process
- ✅ **Inactivity Detection** — Automatic trigger when owner stops checking in
- ✅ **Wallet Integration** — Multi-wallet support via StellarWalletsKit (Freighter, xBull, Albedo, etc.)
- ✅ **Real-Time Updates** — Contract state polls every 5 seconds
- ✅ **Transaction Tracking** — Pending → Success/Failed with explorer links
- ✅ **Event Feed** — All contract events displayed with timestamps and details
- ✅ **Responsive Design** — Works on desktop and mobile
- ✅ **Dark Mode** — Built-in theme support
- ✅ **Toast Notifications** — User-friendly error and success messages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Rust, Soroban SDK v25 |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **State Management** | Zustand |
| **Server State** | TanStack Query |
| **Wallet** | StellarWalletsKit, Freighter API |
| **Blockchain** | Stellar SDK, Soroban RPC |

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── dashboard/         # Wallet dashboard
│   │   ├── app/               # Main contract interaction
│   │   ├── activity/          # Event feed
│   │   └── transactions/      # Transaction history
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── Contract.tsx      # Main contract UI
│   │   ├── EventFeed.tsx     # Event stream
│   │   ├── TransactionTracker.tsx
│   │   └── providers.tsx     # React Query + Theme providers
│   ├── hooks/
│   │   ├── contract.ts       # Contract interaction hooks
│   │   └── useWallet.ts      # Wallet integration
│   ├── lib/
│   │   ├── stellar.ts        # Stellar SDK helpers
│   │   ├── utils.ts          # Utility functions
│   │   └── constants.ts      # App constants
│   ├── stores/
│   │   └── walletStore.ts    # Zustand store
│   └── types/
│       └── index.ts          # TypeScript types
├── contracts/                 # Contract ABI files (generated)
├── scripts/
│   └── deploy.sh             # Contract deployment script
├── .env.example
├── .env.local
├── package.json
└── README.md

contract/
├── Cargo.toml                 # Workspace root
└── contracts/contract/
    ├── Cargo.toml
    └── src/
        ├── lib.rs            # Contract implementation
        └── test.rs           # Tests (12 passing)
```

## Setup

### Prerequisites

- Node.js 20.9+
- Bun (or npm/pnpm)
- Rust toolchain with wasm32 target
- Stellar CLI (`cargo install stellar-cli`)

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_RPC_URL` | Soroban RPC endpoint (testnet) |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Stellar network passphrase |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract ID (C...) |

### Wallet Setup

The app supports multiple Stellar wallets via StellarWalletsKit:

- **Freighter** — [Install from Chrome Web Store](https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakimdplbam)
- **xBull** — [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/xbull-wallet/obcffclbpaamdgebfimegoddnaocejbp)
- **Albedo** — [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/albedo/albedokhcfgljlfibidoijjnhpkknopdm)
- **Rabet** — [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/rabet-wallet/pigojodggbofahfffmfjleldgheibgpa)

Switch your wallet to **Stellar Testnet** network.

### Contract Deployment

```bash
# Build and deploy the contract
cd contract
stellar contract build

# Create and fund a dev identity
stellar keys generate dev --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/digital_inheritance.wasm \
  --source-account dev \
  --network testnet

# Copy the contract ID (C...) and set it in client/.env.local
```

Or use the included deploy script:

```bash
cd client
bun run deploy
```

### Local Development

```bash
# Install dependencies
cd client
bun install

# Set contract address in .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=C..." >> .env.local

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Contract Tests

```bash
cd contract
cargo test
```

Expected output: `12 passed; 0 failed`

## Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_NETWORK_PASSPHRASE`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
4. Deploy.

## Smart Contract API

### State-Modifying Functions

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(owner, inactivity_period)` | — | Initialize the contract (one-time) |
| `check_in(owner)` | owner | Reset inactivity timer |
| `add_beneficiary(owner, beneficiary, amount)` | owner | Add beneficiary with allocation |
| `remove_beneficiary(owner, beneficiary)` | owner | Remove a beneficiary |
| `add_executor(owner, executor)` | owner | Add an executor |
| `remove_executor(owner, executor)` | owner | Remove an executor |
| `trigger_inheritance(executor)` | executor | Start inheritance (after inactivity) |
| `confirm_distribution(executor)` | executor | Confirm distribution for claims |
| `claim(beneficiary)` | beneficiary | Claim allocated amount |

### Read-Only Functions

| Function | Returns |
|----------|---------|
| `owner()` | Address |
| `status()` | u32 (0=Active, 1=Triggered, 2=Confirmed) |
| `last_check_in()` | u64 (timestamp) |
| `inactivity_period()` | u64 (seconds) |
| `beneficiaries()` | Vec<Address> |
| `beneficiary_amount(addr)` | i128 |
| `executors()` | Vec<Address> |
| `has_claimed(addr)` | bool |
| `is_inactive()` | bool |

### Events

All state changes emit events visible in the app's Event Feed:
- `initialized`, `check_in`, `beneficiary_added`, `beneficiary_removed`
- `executor_added`, `executor_removed`, `inheritance_triggered`
- `distribution_confirmed`, `claimed`

## License

MIT
