import { defineChain } from "viem";

// viem Chain definition for GenLayer Testnet Bradbury, used to configure Privy
// so its embedded wallet can sit on chain 4221 and sign GenLayer (EVM) txs.
export const bradburyChain = defineChain({
  id: 4221,
  name: "GenLayer Bradbury Testnet",
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-bradbury.genlayer.com"] },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Bradbury Explorer",
      url: "https://explorer-bradbury.genlayer.com/",
    },
  },
  testnet: true,
});

export const BRADBURY_CHAIN_ID = 4221;
