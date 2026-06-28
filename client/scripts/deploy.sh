#!/bin/bash
set -e

# Digital Inheritance - Contract Deployment Script
# This script builds and deploys the Soroban contract to Stellar Testnet.

echo "=== Digital Inheritance Contract Deployment ==="
echo ""

# Configuration
NETWORK="testnet"
CONTRACT_DIR="../contract"
WASM_TARGET="target/wasm32v1-none/release/digital_inheritance.wasm"

# Check prerequisites
echo "[1/4] Checking prerequisites..."
command -v stellar >/dev/null 2>&1 || { echo "Error: stellar CLI not found. Install it first."; exit 1; }
echo "  ✓ stellar CLI found"

# Build contract
echo "[2/4] Building contract..."
cd "$CONTRACT_DIR"
stellar contract build
echo "  ✓ Contract built successfully"

# Generate identity if not exists
echo "[3/4] Setting up identity..."
if ! stellar keys ls 2>/dev/null | grep -q "dev"; then
  echo "  Creating new dev identity..."
  stellar keys generate dev --network "$NETWORK" --fund
  echo "  ✓ Dev identity created and funded"
else
  echo "  ✓ Dev identity already exists"
fi

# Deploy contract
echo "[4/4] Deploying contract..."
DEPLOY_OUTPUT=$(stellar contract deploy \
  --wasm "$WASM_TARGET" \
  --source-account dev \
  --network "$NETWORK" 2>&1)

CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | tail -1)
echo "  ✓ Contract deployed!"
echo ""
echo "============================================"
echo "Contract ID: $CONTRACT_ID"
echo "Network:     $NETWORK"
echo "Explorer:    https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo "============================================"
echo ""
echo "Add this to your .env.local:"
echo "  NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
