"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "./WalletProvider";
import { shortAddr } from "@/lib/genlayer";
import { Container } from "./ui";

const NAV = [
  { href: "/disputes", label: "Disputes" },
  { href: "/file", label: "File a Claim" },
];

export function Header() {
  const { account, connect, disconnect, connecting } = useWallet();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center border border-accent text-accent">
              <span className="h-2 w-2 bg-accent" />
            </span>
            <span className="text-[15px] font-bold tracking-tight">
              ARTQUITY
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-accent" : "text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 border border-border px-2.5 py-1 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent dot-live" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Bradbury
            </span>
          </span>
          {account ? (
            <button
              onClick={disconnect}
              title="Disconnect"
              className="border border-border-strong px-3 py-1.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
            >
              {shortAddr(account)}
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-accent px-4 py-1.5 text-sm font-semibold text-[#06070a] transition-colors hover:bg-accent-press disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect"}
            </button>
          )}
        </div>
      </Container>
    </header>
  );
}
