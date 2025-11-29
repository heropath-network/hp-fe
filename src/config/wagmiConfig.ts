import { createConfig, http } from "@wagmi/vue";
import { bsc } from "@wagmi/vue/chains";
import { injected, walletConnect } from "@wagmi/vue/connectors";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

declare module "@wagmi/vue" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
      },
    }),
  ],
  transports: {
    [bsc.id]: http(),
  },
});
