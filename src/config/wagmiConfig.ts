import { createConfig, http } from "@wagmi/vue";
import { arbitrum, bsc, optimism } from '@wagmi/vue/chains'
import { injected, walletConnect } from "@wagmi/vue/connectors";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

declare module "@wagmi/vue" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: [arbitrum, bsc, optimism],
  connectors: [
    injected(),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
      },
    }),
  ],
  transports: {
    [arbitrum.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
  },
})
