import { computed, ref, watch, Ref } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { fromBigInt } from '@/utils/bigint'
import { ProjectId } from '@/constants'
import { useGainsPrice24h } from '@/packages/gains'
import { useMuxV3Price24h } from "@/packages/mux-v3";

export interface MarketPrice24hState {
  price24hRate: number | null;
  symbol: string;
  isLoading: boolean;
}

const INITIAL_STATE: MarketPrice24hState = {
  price24hRate: null,
  symbol: "",
  isLoading: true,
};

export function useMarketPrice24hRate(symbol: Ref<string | null | undefined>) {
  const tradeStore = useTradeStore();

  const gainsPrice24h = useGainsPrice24h();
  const muxV3Price24h = useMuxV3Price24h();

  const state = ref<MarketPrice24hState>({ ...INITIAL_STATE });

  const currentPrice = computed(() => {
    if (!symbol.value) return null;
    const market = tradeStore.marketPrices[symbol.value];
    return market?.price ? parseFloat(fromBigInt(market.price, 8)) : null;
  });

  const calculate24hRate = () => {
    if (!symbol.value || !currentPrice.value) {
      state.value.price24hRate = null;
      return;
    }

    const selectedOracle = tradeStore.selectedOracle;
    let rate = 0;

    if (selectedOracle === ProjectId.GAINS) {
      // GTrade: use full symbol (e.g., "BTC/USD")
      rate = gainsPrice24h.calculate24hChangeRate(
        currentPrice.value,
        symbol.value
      );
    } else {
      // MUX V3: use base symbol (e.g., "BTC")
      const symbolName = symbol.value.split("/")[0];
      rate = muxV3Price24h.calculate24hChangeRate(
        currentPrice.value,
        symbolName
      );
    }

    state.value.price24hRate = rate;
    state.value.symbol = symbol.value;
    state.value.isLoading = false;
  };

  watch(
    [
      currentPrice,
      () => gainsPrice24h.price24hAgoMap.value,
      () => muxV3Price24h.price24hAgoMap.value,
      () => tradeStore.selectedOracle,
    ],
    () => {
      calculate24hRate();
    },
    { immediate: true }
  );

  watch(
    symbol,
    (newSymbol) => {
      if (!newSymbol) {
        state.value = { ...INITIAL_STATE };
        // Stop all fetching when no symbol
        gainsPrice24h.stopAutoRefresh();
        muxV3Price24h.stopAutoRefresh();
        return;
      }

      const selectedOracle = tradeStore.selectedOracle;

      if (selectedOracle === ProjectId.GAINS) {
        muxV3Price24h.stopAutoRefresh();
        gainsPrice24h.startAutoRefresh();
      } else if (selectedOracle === ProjectId.MUX_V3) {
        gainsPrice24h.stopAutoRefresh();
        const symbolName = newSymbol.split("/")[0];
        muxV3Price24h.startAutoRefresh([symbolName]);
      } else {
        gainsPrice24h.stopAutoRefresh();
        muxV3Price24h.stopAutoRefresh();
      }

      calculate24hRate();
    },
    { immediate: true }
  );

  watch(
    () => tradeStore.selectedOracle,
    (newOracle, oldOracle) => {
      if (newOracle !== oldOracle && symbol.value) {
        if (oldOracle === ProjectId.GAINS) {
          gainsPrice24h.stopAutoRefresh();
        } else if (oldOracle === ProjectId.MUX_V3) {
          muxV3Price24h.stopAutoRefresh();
        }

        if (newOracle === ProjectId.GAINS) {
          muxV3Price24h.stopAutoRefresh();
          gainsPrice24h.startAutoRefresh();
        } else if (newOracle === ProjectId.MUX_V3) {
          gainsPrice24h.stopAutoRefresh();
          const symbolName = symbol.value.split("/")[0];
          muxV3Price24h.startAutoRefresh([symbolName]);
        } else {
          gainsPrice24h.stopAutoRefresh();
          muxV3Price24h.stopAutoRefresh();
        }

        calculate24hRate();
      }
    }
  );

  return state;
}
