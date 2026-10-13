import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";

import { UserMenu } from "@/features/auth/components/user-menu";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuddyBuddy",
  description: "Find collaborators for the projects you want to build.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* First thing Tab reaches: jump past the header to the page. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow dark:focus:bg-zinc-900"
        >
          Skip to content
        </a>
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <Link href="/" className="font-semibold">
            BuddyBuddy
          </Link>
          {/* The rest of the page doesn't wait for the session check. */}
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </header>
        {/* tabIndex -1: the skip link can move focus here. */}
        <div
          id="content"
          tabIndex={-1}
          className="flex flex-1 flex-col outline-none"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
