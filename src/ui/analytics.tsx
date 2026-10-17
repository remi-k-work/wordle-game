"use client";

// next
import dynamic from "next/dynamic";

// Analytics only records page views — it never blocks interaction, so load it
// after hydration instead of shipping it in every route's initial bundle
// (bundle-defer-third-party)
const VercelAnalytics = dynamic(() => import("@vercel/analytics/next").then((m) => m.Analytics), { ssr: false });

export function Analytics() {
  return <VercelAnalytics debug={false} />;
}
