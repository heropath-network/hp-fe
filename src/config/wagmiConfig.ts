import { createConfig, http } from "@wagmi/vue";
import { bsc } from "@wagmi/vue/chains";
import { injected } from "@wagmi/vue/connectors";

declare module "@wagmi/vue" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(),
  },
});
