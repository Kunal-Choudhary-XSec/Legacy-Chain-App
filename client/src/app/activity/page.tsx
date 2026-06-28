"use client";

import EventFeed from "@/components/EventFeed";

export default function ActivityPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
      <p className="text-muted-foreground mb-8">
        Real-time events from the Digital Inheritance contract.
      </p>
      <EventFeed />
    </div>
  );
}
