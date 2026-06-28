"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Users,
  Key,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground mb-4">
          <ShieldCheck className="h-4 w-4" />
          Powered by Stellar Soroban
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Digital Inheritance
          <span className="block text-primary mt-2">on Stellar</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A decentralized inheritance contract that automatically transfers assets to
          beneficiaries when the owner becomes inactive, with executor verification.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/app">
            <Button size="lg" className="gap-2">
              Launch App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <Key className="h-8 w-8 text-primary mb-2" />
            <CardTitle>1. Setup</CardTitle>
            <CardDescription>
              Owner sets up the inheritance contract with an inactivity period and
              whitelists beneficiaries and executors.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>2. Monitoring</CardTitle>
            <CardDescription>
              The contract monitors owner activity via periodic check-ins. If the owner
              stops checking in, the inactivity timer expires.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <CardTitle>3. Execution</CardTitle>
            <CardDescription>
              An executor triggers the inheritance, confirms distribution, and
              beneficiaries can then claim their allocated amounts.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Beneficiary Whitelist",
                  desc: "Owner can whitelist multiple beneficiaries with specific asset allocations.",
                },
                {
                  icon: <Key className="h-5 w-5" />,
                  title: "Executor Confirmation",
                  desc: "Trusted executors verify owner inactivity and confirm distribution before claims.",
                },
                {
                  icon: <Activity className="h-5 w-5" />,
                  title: "Inactivity Trigger",
                  desc: "Automatic inheritance process starts when owner misses check-in for the configured period.",
                },
                {
                  icon: <ShieldCheck className="h-5 w-5" />,
                  title: "Secure & Transparent",
                  desc: "All actions are recorded on the Stellar blockchain with full event history.",
                },
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary">{feature.icon}</span>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Footer Info */}
      <section className="text-center text-sm text-muted-foreground pb-8">
        <p>
          Built with Next.js, TypeScript, Tailwind CSS, and the Stellar Soroban SDK.
        </p>
      </section>
    </div>
  );
}
