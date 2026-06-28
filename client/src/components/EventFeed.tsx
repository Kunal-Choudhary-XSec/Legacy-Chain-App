"use client";

import { useWalletStore } from "@/stores/walletStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime, truncateAddress } from "@/lib/utils";
import {
  Activity,
  UserPlus,
  UserMinus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const eventIcons: Record<string, React.ReactNode> = {
  initialized: <ShieldCheck className="h-4 w-4 text-primary" />,
  check_in: <Activity className="h-4 w-4 text-green-500" />,
  beneficiary_added: <UserPlus className="h-4 w-4 text-blue-500" />,
  beneficiary_removed: <UserMinus className="h-4 w-4 text-yellow-500" />,
  executor_added: <ShieldCheck className="h-4 w-4 text-purple-500" />,
  executor_removed: <ShieldAlert className="h-4 w-4 text-orange-500" />,
  inheritance_triggered: <AlertTriangle className="h-4 w-4 text-red-500" />,
  distribution_confirmed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  claimed: <Clock className="h-4 w-4 text-blue-500" />,
};

const eventLabels: Record<string, string> = {
  initialized: "Contract Initialized",
  check_in: "Owner Checked In",
  beneficiary_added: "Beneficiary Added",
  beneficiary_removed: "Beneficiary Removed",
  executor_added: "Executor Added",
  executor_removed: "Executor Removed",
  inheritance_triggered: "Inheritance Triggered",
  distribution_confirmed: "Distribution Confirmed",
  claimed: "Claimed",
};

export default function EventFeed() {
  const events = useWalletStore((s) => s.events);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Event Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No events yet. Interact with the contract to see events here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event, i) => (
              <div key={i}>
                {i > 0 && <Separator />}
                <div className="flex items-start gap-3 py-3">
                  <div className="mt-0.5">
                    {eventIcons[event.type] || <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {eventLabels[event.type] || event.type}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {event.data &&
                        Object.entries(event.data).map(([key, val]) => (
                          <span key={key}>
                            {key}:{" "}
                            {typeof val === "string" && val.startsWith("G")
                              ? truncateAddress(val, 6)
                              : String(val)}
                          </span>
                        ))}
                      <span>{formatRelativeTime(event.timestamp)}</span>
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
