"use client";

import ContractUI from "@/components/Contract";

export default function AppPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Digital Inheritance App</h1>
      <p className="text-muted-foreground mb-8">
        Manage your inheritance contract, beneficiaries, and executors.
      </p>
      <ContractUI />
    </div>
  );
}
