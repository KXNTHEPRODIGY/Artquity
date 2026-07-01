"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { bradburyChain } from "@/lib/chain";
import {
  PrivyWalletBridge,
  WalletFallbackProvider,
} from "@/components/WalletProvider";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function Providers({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <WalletFallbackProvider>{children}</WalletFallbackProvider>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: bradburyChain,
        supportedChains: [bradburyChain],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <PrivyWalletBridge>{children}</PrivyWalletBridge>
    </PrivyProvider>
  );
}
