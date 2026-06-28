"use client";

import { useWalletStore } from "@/stores/walletStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, explorerUrl } from "@/lib/utils";
import {
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-500",
  success: "text-green-500",
  failed: "text-red-500",
};

export default function TransactionTracker() {
  const transactions = useWalletStore((s) => s.transactions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transactions yet. Perform an action to see it here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx, i) => (
              <div key={tx.hash}>
                {i > 0 && <Separator />}
                <div className="flex items-start gap-3 py-3">
                  <div className="mt-0.5">
                    {statusIcons[tx.status] || null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{tx.type}</p>
                      <span className={`text-xs font-medium capitalize ${statusColors[tx.status]}`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {tx.hash.substring(0, 20)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(tx.timestamp)}
                      </span>
                      <a
                        href={explorerUrl(tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
