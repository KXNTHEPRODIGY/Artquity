import {
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  explorerAddressUrl,
  shortAddr,
} from "@/lib/genlayer";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center border border-border-strong text-accent">
            <span className="h-1.5 w-1.5 bg-accent" />
          </span>
          <span className="text-sm font-semibold tracking-tight">ARTQUITY</span>
          <span className="text-sm text-faint">· Adjudicated on GenLayer</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
          <span className="text-faint">Testnet Bradbury · 4221</span>
          {CONTRACT_ADDRESS && (
            <a
              href={explorerAddressUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
            >
              Contract {shortAddr(CONTRACT_ADDRESS)}
            </a>
          )}
          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent"
          >
            Explorer ↗
          </a>
        </div>
      </Container>
    </footer>
  );
}
