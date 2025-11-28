import { computed, type Ref } from "vue";
import {
  useMux3AssetPriceComposition,
  useMux3MqttSingletonComposition,
} from "../compositions/mux3MqttPriceServiceComposition";

let mqttInitialized = false;

/**
 * Extract market symbol from chart symbol (e.g., "BTC/USD" -> "BTC")
 */
function extractMarketSymbol(
  chartSymbol: string | null | undefined
): string | null {
  if (!chartSymbol) return null;

  const parts = chartSymbol.split("/");
  return parts[0]?.toUpperCase() || chartSymbol.toUpperCase();
}

export function useMuxRealtimePrice(
  symbol: Ref<string | null | undefined>,
  refreshInterval = 200
) {
  if (!mqttInitialized) {
    useMux3MqttSingletonComposition();
    mqttInitialized = true;
  }

  const marketSymbol = computed(() => extractMarketSymbol(symbol.value));

  const { priceInfo } = useMux3AssetPriceComposition(
    marketSymbol,
    true,
    refreshInterval
  );

  const price = computed(() => {
    if (!priceInfo.value || !priceInfo.value[0]) return null;
    return parseFloat(priceInfo.value[0]);
  });

  return {
    price,
    priceInfo,
  };
}
