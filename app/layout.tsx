import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JABB Networks — Enterprise automation talent",
    template: "%s · JABB Networks",
  },
  description:
    "The freelance network for Power Platform, RPA, SharePoint migration and AI delivery specialists. Post a scope, compare proposals, run the work through milestones.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
