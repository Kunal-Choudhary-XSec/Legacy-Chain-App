"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useContract } from "@/hooks/contract";
import { useWallet } from "@/hooks/useWallet";
import { STATUS_MAP, STATUS_COLORS } from "@/types";
import { truncateAddress, parseContractError, formatRelativeTime } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import {
  Loader2,
  ShieldCheck,
  Users,
  Key,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  UserMinus,
  Activity,
} from "lucide-react";

export default function ContractUI() {
  const { isConnected, address, isOwner, isExecutor, isBeneficiary, signTransaction } = useWallet();
  const contract = useContract(signTransaction);
  const [newBeneficiaryAddr, setNewBeneficiaryAddr] = useState("");
  const [newBeneficiaryAmount, setNewBeneficiaryAmount] = useState("");
  const [newExecutorAddr, setNewExecutorAddr] = useState("");

  const handleError = useCallback(
    (err: unknown) => {
      const msg = parseContractError(err);
      contract.error !== msg && contract.clearError();
    },
    [contract]
  );

  if (!CONTRACT_ADDRESS) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Contract Not Deployed</CardTitle>
          <CardDescription>
            Set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables to connect to a deployed contract.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Stellar wallet to interact with the Digital Inheritance contract.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!contract.state) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading contract state...</span>
        </CardContent>
      </Card>
    );
  }

  const { state, loading } = contract;
  const statusColor = STATUS_COLORS[state.status] || "text-gray-500";
  const statusLabel = STATUS_MAP[state.status] || "Unknown";

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Inheritance Status
          </CardTitle>
          <CardDescription>
            Contract: {truncateAddress(CONTRACT_ADDRESS, 8)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`font-semibold ${statusColor}`}>{statusLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-mono text-sm">{truncateAddress(state.owner)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Inactivity Period</p>
              <p className="font-semibold">{state.inactivityPeriod}s</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="flex items-center gap-1">
                {state.isInactive ? (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" /> Inactive
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" /> Active
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Check-In</p>
              <p className="text-sm">{state.lastCheckIn > 0 ? formatRelativeTime(state.lastCheckIn) : "Never"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Beneficiaries</p>
              <p className="font-semibold">{state.beneficiaries.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Executors</p>
              <p className="font-semibold">{state.executors.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Actions */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Owner Actions
            </CardTitle>
            <CardDescription>
              Manage beneficiaries and executors for your digital inheritance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Check In */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Keep Alive</p>
                <p className="text-sm text-muted-foreground">
                  Reset the inactivity timer to prevent inheritance trigger.
                </p>
              </div>
              <Button onClick={contract.checkin} disabled={loading || state.status !== 0}>
                <Activity className="h-4 w-4 mr-1" />
                {loading ? "Processing..." : "Check In"}
              </Button>
            </div>
            <Separator />

            {/* Add Beneficiary */}
            <div className="space-y-3">
              <p className="font-medium">Add Beneficiary</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="ben-addr">Beneficiary Address</Label>
                  <Input
                    id="ben-addr"
                    placeholder="G..."
                    value={newBeneficiaryAddr}
                    onChange={(e) => setNewBeneficiaryAddr(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Label htmlFor="ben-amount">Amount</Label>
                  <Input
                    id="ben-amount"
                    placeholder="1000"
                    value={newBeneficiaryAmount}
                    onChange={(e) => setNewBeneficiaryAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={async () => {
                      try {
                        await contract.addBeneficiary(newBeneficiaryAddr, newBeneficiaryAmount);
                        setNewBeneficiaryAddr("");
                        setNewBeneficiaryAmount("");
                      } catch (err) {
                        handleError(err);
                      }
                    }}
                    disabled={loading || !newBeneficiaryAddr || !newBeneficiaryAmount || state.status !== 0}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <Separator />

            {/* Add Executor */}
            <div className="space-y-3">
              <p className="font-medium">Add Executor</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="exec-addr">Executor Address</Label>
                  <Input
                    id="exec-addr"
                    placeholder="G..."
                    value={newExecutorAddr}
                    onChange={(e) => setNewExecutorAddr(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={async () => {
                      try {
                        await contract.addExecutor(newExecutorAddr);
                        setNewExecutorAddr("");
                      } catch (err) {
                        handleError(err);
                      }
                    }}
                    disabled={loading || !newExecutorAddr || state.status !== 0}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {contract.error && (
              <p className="text-sm text-destructive mt-2">{contract.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Executor Actions */}
      {isExecutor && state.status < 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Executor Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.status === 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Trigger Inheritance</p>
                  <p className="text-sm text-muted-foreground">
                    {state.isInactive
                      ? "Owner is inactive. You can trigger the inheritance process."
                      : "Owner is still active. Inheritance can only be triggered after the inactivity period."}
                  </p>
                </div>
                <Button
                  onClick={contract.triggerInheritance}
                  disabled={loading || !state.isInactive}
                  variant="destructive"
                >
                  {loading ? "Processing..." : "Trigger"}
                </Button>
              </div>
            )}
            {state.status === 1 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Confirm Distribution</p>
                  <p className="text-sm text-muted-foreground">
                    Confirm the distribution so beneficiaries can claim.
                  </p>
                </div>
                <Button onClick={contract.confirmDistribution} disabled={loading}>
                  {loading ? "Processing..." : "Confirm"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Beneficiary Actions */}
      {isBeneficiary && state.status === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Claim Your Inheritance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Amount:{" "}
                  {state.beneficiaries
                    .filter((b) => b.address === address)
                    .map((b) => b.amount)
                    .join(", ") || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  The distribution has been confirmed. You can now claim your allocation.
                </p>
              </div>
              <Button onClick={contract.claim} disabled={loading}>
                {loading ? "Processing..." : "Claim"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficiaries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Beneficiaries ({state.beneficiaries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.beneficiaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No beneficiaries added yet.</p>
          ) : (
            <div className="space-y-2">
              {state.beneficiaries.map((ben, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <div>
                    <p className="font-mono text-sm">{truncateAddress(ben.address, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {ben.address === address ? "You" : "Beneficiary"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{ben.amount}</span>
                    {isOwner && state.status === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => contract.removeBeneficiary(ben.address)}
                        disabled={loading}
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Executors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Executors ({state.executors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.executors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No executors added yet.</p>
          ) : (
            <div className="space-y-2">
              {state.executors.map((exec, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <div>
                    <p className="font-mono text-sm">{truncateAddress(exec, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {exec === address ? "You" : "Executor"}
                    </p>
                  </div>
                  {isOwner && state.status === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => contract.removeExecutor(exec)}
                      disabled={loading}
                    >
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
