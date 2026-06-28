"use client";

import TransactionTracker from "@/components/TransactionTracker";

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
      <p className="text-muted-foreground mb-8">
        Track the status of your blockchain transactions.
      </p>
      <TransactionTracker />
    </div>
  );
}
