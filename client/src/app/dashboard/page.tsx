"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/contract";
import { truncateAddress, formatRelativeTime } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { STATUS_MAP, STATUS_COLORS } from "@/types";
import {
  Wallet,
  Copy,
  ExternalLink,
  ShieldCheck,
  Activity,
  Users,
  Key,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const wallet = useWallet();
  const contract = useContract();

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </CardTitle>
          <CardDescription>
            Your connected Stellar wallet information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet.isConnected ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">Connect your wallet to see dashboard information.</p>
              <Button onClick={() => wallet.connect()}>Connect Wallet</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{truncateAddress(wallet.address, 8)}</span>
                  <button
                    onClick={() => copyAddress(wallet.address)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="font-semibold">{wallet.balance} XLM</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="font-semibold">Testnet</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Roles</span>
                <div className="flex gap-2">
                  {wallet.isOwner && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Owner
                    </span>
                  )}
                  {wallet.isExecutor && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
                      Executor
                    </span>
                  )}
                  {wallet.isBeneficiary && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                      Beneficiary
                    </span>
                  )}
                  {!wallet.isOwner && !wallet.isExecutor && !wallet.isBeneficiary && (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Contract
          </CardTitle>
          <CardDescription>
            Digital Inheritance contract details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!CONTRACT_ADDRESS ? (
            <p className="text-muted-foreground">
              Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{truncateAddress(CONTRACT_ADDRESS, 10)}</span>
                  <button
                    onClick={() => copyAddress(CONTRACT_ADDRESS)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Separator />
              {contract.state ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`font-semibold ${STATUS_COLORS[contract.state.status]}`}>
                      {STATUS_MAP[contract.state.status]}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Owner Activity</span>
                    <span className="flex items-center gap-1">
                      {contract.state.isInactive ? (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <XCircle className="h-4 w-4" /> Inactive
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> Active
                        </span>
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Inactivity Period</span>
                    <span className="font-semibold">{contract.state.inactivityPeriod}s</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Check-in</span>
                    <span className="text-sm">
                      {contract.state.lastCheckIn > 0
                        ? formatRelativeTime(contract.state.lastCheckIn)
                        : "Never"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Beneficiaries</span>
                    <span className="font-semibold">{contract.state.beneficiaries.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Executors</span>
                    <span className="font-semibold">{contract.state.executors.length}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading contract state...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => window.location.href = "/app"}
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs">Open App</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => window.location.href = "/activity"}
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">Activity</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => window.location.href = "/transactions"}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Transactions</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1"
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`, '_blank')}
            >
              <ExternalLink className="h-5 w-5" />
              <span className="text-xs">Explorer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
