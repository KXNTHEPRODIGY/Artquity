"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrivy, useLogin, useLogout, useWallets } from "@privy-io/react-auth";
import { getWriteClient, type Client } from "@/lib/genlayer";
import { BRADBURY_CHAIN_ID } from "@/lib/chain";

interface WalletState {
  account: `0x${string}` | null;
  client: Client | null;
  connecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a wallet provider");
  return ctx;
}

/**
 * Bridges Privy auth → a genlayer-js write client. Privy's embedded wallet
 * exposes an EIP-1193 provider; on Bradbury a GenLayer write is a standard EVM
 * tx, so that provider can sign it directly — no MetaMask, no window.ethereum,
 * no Snap. Must be rendered inside <PrivyProvider>.
 */
export function PrivyWalletBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { wallets } = useWallets();

  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable dependency so the effect only re-runs when the wallet set changes.
  const walletKey = wallets.map((w) => w.address).join(",");

  useEffect(() => {
    let cancelled = false;

    async function build() {
      if (!authenticated || wallets.length === 0) {
        setAccount(null);
        setClient(null);
        return;
      }
      // Prefer the Privy embedded wallet; fall back to the first connected one.
      const wallet =
        wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
      try {
        setInitializing(true);
        setError(null);
        await wallet.switchChain(BRADBURY_CHAIN_ID);
        const provider = await wallet.getEthereumProvider();
        if (cancelled) return;
        const addr = wallet.address as `0x${string}`;
        setClient(getWriteClient(addr, provider as unknown as EthereumProvider));
        setAccount(addr);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to initialize wallet.",
          );
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    build();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, walletKey]);

  const connect = useCallback(() => {
    setError(null);
    if (!ready) return;
    if (!authenticated) login();
  }, [ready, authenticated, login]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setClient(null);
    logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      account,
      client,
      connecting: !ready || initializing,
      error,
      connect,
      disconnect,
    }),
    [account, client, ready, initializing, error, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/**
 * Used when NEXT_PUBLIC_PRIVY_APP_ID is missing. Renders the app but surfaces a
 * clear setup message instead of crashing inside <PrivyProvider>.
 */
export function WalletFallbackProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const connect = useCallback(() => {
    setError(
      "Wallet login is unavailable: set NEXT_PUBLIC_PRIVY_APP_ID in web/.env.local and restart the dev server.",
    );
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      account: null,
      client: null,
      connecting: false,
      error,
      connect,
      disconnect: () => {},
    }),
    [error, connect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
