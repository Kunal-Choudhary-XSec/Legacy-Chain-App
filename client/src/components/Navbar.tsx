"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";
import { Wallet, LogOut, Activity, History, LayoutDashboard, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app", label: "App", icon: Activity },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/transactions", label: "Transactions", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, address, connect, disconnect, isConnecting } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch {
      // error toast is handled by the hook
    }
  }, [connect]);

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-8">
          <Activity className="h-5 w-5 text-primary" />
          <span>Digital Inheritance</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isConnected ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {truncateAddress(address, 5)}
              </div>
              <Button variant="outline" size="sm" onClick={disconnect}>
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4 mr-1" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-foreground" />
              <span className="block w-5 h-0.5 bg-foreground" />
              <span className="block w-5 h-0.5 bg-foreground" />
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
