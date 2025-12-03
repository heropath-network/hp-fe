import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useConnection } from '@wagmi/vue'
import { ProjectId, ORACLE_NAMES } from '@/constants'
import { autoSelectOracle } from '@/utils/oracleMatching'
import {
  LIQUIDITY_SOURCES,
  LiquiditySourceId,
  LiquiditySourceInfo,
  SupportedLiquidityAsset,
} from '@/constants/liquiditySources'
import {
  useUserPositionsStorage,
  useUserOrdersStorage,
  useUserTradeHistoryStorage,
  type Position,
  type Order,
  type TradeHistory,
} from '@/storages/trading'

export interface MarketPrice {
  symbol: string
  price: bigint
  change24h: number
  timestamp: number
}

type MarginMode = 'isolated' | 'cross'

interface MarginSetting {
  mode: MarginMode
  leverage?: number
}

interface LiquiditySourceState extends LiquiditySourceInfo {
  enabled: boolean
}

const DEFAULT_MARGIN_SETTING: MarginSetting = {
  mode: 'cross',
  leverage: 5,
}

const MARGIN_SETTINGS_STORAGE_KEY = 'hp-margin-settings'

function readMarginSettingsFromStorage(): Record<string, MarginSetting> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = window.localStorage.getItem(MARGIN_SETTINGS_STORAGE_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return parsed
  } catch (error) {
    console.warn('Failed to parse margin settings from storage', error)
    return {}
  }
}

export const useTradeStore = defineStore('trade', () => {
  const { address } = useConnection()

  // Initialize storage
  const positionsStorage = useUserPositionsStorage(address)
  const ordersStorage = useUserOrdersStorage(address)
  const tradeHistoryStorage = useUserTradeHistoryStorage(address)

  const selectedMarket = ref('BTC/USD')
  const marketPrices = ref<Record<string, MarketPrice>>({})

  const availableOracles = ref<ProjectId[]>([
    ProjectId.MUX_V3, // Default (Aster)
    ProjectId.GAINS, // GTrade
    ProjectId.FOUR_MEME, // Four.meme
  ])
  const selectedOracle = ref<ProjectId>(ProjectId.MUX_V3)

  /**
   * Auto-select oracle based on market availability
   * Defaults to Aster (MUX_V3), falls back to gTrade (GAINS)
   */
  function autoSelectOracleForMarket(market: string) {
    const oracle = autoSelectOracle(market)
    if (oracle !== null) {
      selectedOracle.value = oracle
    } else {
      console.warn(
        `Market ${market} is not available in any oracle. Keeping current oracle: ${
          ORACLE_NAMES[selectedOracle.value]
        }`,
      )
    }
  }

  const oracleSources = computed(() => availableOracles.value.map((id) => ORACLE_NAMES[id]))

  const currentOracleName = computed(() => ORACLE_NAMES[selectedOracle.value])

  const accountBalance = ref<bigint>(BigInt(10000) * BigInt(10 ** 18)) // 10,000 USD
  const currentAccountId = ref<string | null>(null)

  // Store refs - use storage data directly, filtered by currentAccountId
  // Filtered by current account
  const positions = computed(() => {
    if (!currentAccountId.value) return []
    return positionsStorage.data.value.filter((p) => p.accountId === currentAccountId.value)
  })

  const orders = computed(() => {
    if (!currentAccountId.value) return []
    return ordersStorage.data.value.filter((o) => o.accountId === currentAccountId.value)
  })

  const tradeHistory = computed(() => {
    if (!currentAccountId.value) return []
    return tradeHistoryStorage.data.value.filter((h) => h.accountId === currentAccountId.value)
  })
  const marginSettings = ref<Record<string, MarginSetting>>(readMarginSettingsFromStorage())
  const liquiditySourceSettings = ref<LiquiditySourceState[]>(
    LIQUIDITY_SOURCES.map((source) => ({
      ...source,
      enabled: source.enabledByDefault ?? true,
    })),
  )

  const currentMarketPrice = computed(() => {
    return marketPrices.value[selectedMarket.value]?.price || BigInt(0)
  })

  const totalPositionValue = computed(() => {
    return positions.value.reduce((sum, pos) => sum + pos.size, BigInt(0))
  })

  const totalPnL = computed(() => {
    let totalPnL = BigInt(0)
    for (const pos of positions.value) {
      const currentPrice = marketPrices.value[pos.market]?.price || pos.entryPrice
      const priceDiff = currentPrice - pos.entryPrice
      const multiplier = pos.side === 'long' ? BigInt(1) : BigInt(-1)
      const positionPnL = ((priceDiff * pos.size) / pos.entryPrice) * multiplier
      totalPnL += positionPnL
    }
    return totalPnL
  })

  const SUPPORTED_ASSETS: SupportedLiquidityAsset[] = ['BTC', 'ETH']

  function normalizeAsset(symbol: string): SupportedLiquidityAsset {
    const upperSymbol = symbol?.toUpperCase()
    if (SUPPORTED_ASSETS.includes(upperSymbol as SupportedLiquidityAsset)) {
      return upperSymbol as SupportedLiquidityAsset
    }
    return 'ETH'
  }

  const selectedBaseAsset = computed(() => {
    const marketSymbol = selectedMarket.value?.split('/')?.[0] ?? 'ETH'
    return normalizeAsset(marketSymbol)
  })

  const liquiditySources = computed(() => {
    const baseAsset = selectedBaseAsset.value

    return liquiditySourceSettings.value.map((source) => {
      const capacity = source.capacities[baseAsset]
      const maxLong = capacity?.maxLong ?? null
      const maxShort = capacity?.maxShort ?? null

      return {
        ...source,
        maxLong: {
          amount: maxLong,
          assetSymbol: baseAsset,
        },
        maxShort: {
          amount: maxShort,
          assetSymbol: baseAsset,
        },
      }
    })
  })

  const activeLiquiditySources = computed(() => liquiditySources.value.filter((source) => source.enabled))

  function updateMarketPrice(symbol: string, price: bigint, change24h: number) {
    marketPrices.value[symbol] = {
      symbol,
      price,
      change24h,
      timestamp: Date.now(),
    }
  }

  function setCurrentPrice(price: number, change24hRate?: number) {
    if (price === null || price === undefined || isNaN(price) || !isFinite(price) || price <= 0) {
      console.error('setCurrentPrice: Invalid price value:', price)
      return
    }

    const validChange24hRate =
      change24hRate !== undefined && !isNaN(change24hRate) && isFinite(change24hRate)
        ? change24hRate
        : marketPrices.value[selectedMarket.value]?.change24h || 0

    const priceBigInt = BigInt(Math.floor(price * 10 ** 18))

    marketPrices.value[selectedMarket.value] = {
      symbol: selectedMarket.value,
      price: priceBigInt,
      change24h: validChange24hRate,
      timestamp: Date.now(),
    }
  }

  function getLiquiditySourceFromOracle(oracle: ProjectId): LiquiditySourceId {
    const oracleToLiquiditySource: Record<ProjectId, LiquiditySourceId> = {
      [ProjectId.MUX_V3]: 'aster',
      [ProjectId.GAINS]: 'gtrade',
      [ProjectId.FOUR_MEME]: 'four',
      [ProjectId.NULL_PROJECT]: 'aster', // Default fallback
    }
    return oracleToLiquiditySource[oracle] || 'aster'
  }

  function openPosition(
    market: string,
    side: 'long' | 'short',
    size: bigint,
    entryPrice: bigint,
    leverage: number,
    collateral: bigint,
    chainId?: number,
    liquiditySource?: LiquiditySourceId,
    accountId?: string,
  ) {
    if (!currentAccountId.value && !accountId) {
      console.warn('openPosition: accountId is required but not provided')
      return
    }

    const position: Position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accountId: accountId ?? currentAccountId.value!,
      market,
      side,
      size,
      entryPrice,
      leverage,
      collateral,
      liquidationPrice: calculateLiquidationPrice(entryPrice, leverage, side),
      timestamp: Date.now(),
      chainId: chainId ?? 56, // Default to BNB Chain (56)
      liquiditySource: liquiditySource ?? getLiquiditySourceFromOracle(selectedOracle.value),
    }
    const allPositions = [...positionsStorage.data.value, position]
    positionsStorage.updatePositions(allPositions)
    accountBalance.value -= collateral
  }

  function setLiquiditySourceEnabled(sourceId: LiquiditySourceId, enabled: boolean) {
    const source = liquiditySourceSettings.value.find((item) => item.id === sourceId)
    if (!source) return

    const enabledCount = liquiditySourceSettings.value.filter((item) => item.enabled).length
    if (!enabled && enabledCount <= 1) {
      return
    }

    source.enabled = enabled
  }

  function toggleLiquiditySource(sourceId: LiquiditySourceId) {
    const source = liquiditySourceSettings.value.find((item) => item.id === sourceId)
    if (!source) return
    setLiquiditySourceEnabled(sourceId, !source.enabled)
  }

  function closePosition(positionId: string) {
    const allPositions = positionsStorage.data.value
    const position = allPositions.find((p) => p.id === positionId)
    if (!position) return

    const currentPrice = marketPrices.value[position.market]?.price || position.entryPrice
    const priceDiff = currentPrice - position.entryPrice
    const multiplier = position.side === 'long' ? BigInt(1) : BigInt(-1)
    const pnl = ((priceDiff * position.size) / position.entryPrice) * multiplier

    const historyEntry: TradeHistory = {
      id: position.id,
      accountId: position.accountId,
      market: position.market,
      side: position.side,
      size: position.size,
      entryPrice: position.entryPrice,
      exitPrice: currentPrice,
      pnl,
      timestamp: position.timestamp,
      closeTimestamp: Date.now(),
      chainId: position.chainId,
      liquiditySource: position.liquiditySource,
    }
    const allTradeHistory = [historyEntry, ...tradeHistoryStorage.data.value]
    tradeHistoryStorage.updateTradeHistory(allTradeHistory)

    accountBalance.value += position.collateral + pnl

    const updatedPositions = allPositions.filter((p) => p.id !== positionId)
    positionsStorage.updatePositions(updatedPositions)
  }

  function placeOrder(
    market: string,
    side: 'long' | 'short',
    size: bigint,
    triggerPrice: bigint,
    orderType: 'limit' | 'stop',
    chainId?: number,
    liquiditySource?: LiquiditySourceId,
    accountId?: string,
  ) {
    if (!currentAccountId.value && !accountId) {
      console.warn('placeOrder: accountId is required but not provided')
      return
    }

    const order: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accountId: accountId ?? currentAccountId.value!,
      market,
      side,
      size,
      triggerPrice,
      orderType,
      timestamp: Date.now(),
      chainId: chainId ?? 56, // Default to BNB Chain (56)
      liquiditySource: liquiditySource ?? getLiquiditySourceFromOracle(selectedOracle.value),
    }
    const allOrders = [...ordersStorage.data.value, order]
    ordersStorage.updateOrders(allOrders)
  }

  function cancelOrder(orderId: string) {
    const allOrders = ordersStorage.data.value.filter((o) => o.id !== orderId)
    ordersStorage.updateOrders(allOrders)
  }

  function calculateLiquidationPrice(entryPrice: bigint, leverage: number, side: 'long' | 'short'): bigint {
    // Simplified liquidation price calculation
    // Liq price = entry * (1 - 1/leverage) for long
    // Liq price = entry * (1 + 1/leverage) for short
    const leverageBig = BigInt(leverage)
    const adjustmentFactor = entryPrice / leverageBig

    if (side === 'long') {
      return entryPrice - adjustmentFactor
    } else {
      return entryPrice + adjustmentFactor
    }
  }

  function setOracleByName(oracleName: string) {
    const oracleId = Object.entries(ORACLE_NAMES).find(([_, name]) => name === oracleName)?.[0]
    if (oracleId) {
      selectedOracle.value = Number(oracleId) as ProjectId
    }
  }

  function setMarket(market: string) {
    selectedMarket.value = market
    autoSelectOracleForMarket(market)
  }

  function getMarginSetting(market: string): MarginSetting {
    return marginSettings.value[market] ?? { ...DEFAULT_MARGIN_SETTING }
  }

  function setMarginSetting(market: string, setting: MarginSetting) {
    const safeSetting: MarginSetting = {
      mode: setting.mode,
      leverage: setting.mode === 'cross' ? setting.leverage ?? DEFAULT_MARGIN_SETTING.leverage : undefined,
    }

    marginSettings.value = {
      ...marginSettings.value,
      [market]: safeSetting,
    }
  }

  if (typeof window !== 'undefined') {
    watch(
      marginSettings,
      (value) => {
        window.localStorage.setItem(MARGIN_SETTINGS_STORAGE_KEY, JSON.stringify(value))
      },
      { deep: true },
    )
  }

  watch(selectedMarket, (newMarket) => {
    autoSelectOracleForMarket(newMarket)
  })

  // Initialize oracle for default market
  autoSelectOracleForMarket(selectedMarket.value)

  return {
    selectedMarket,
    marketPrices,
    availableOracles,
    selectedOracle,
    liquiditySources,
    positions,
    orders,
    tradeHistory,
    accountBalance,
    currentAccountId,
    marginSettings,

    currentMarketPrice,
    oracleSources,
    currentOracleName,
    totalPositionValue,
    totalPnL,
    activeLiquiditySources,

    setCurrentPrice,
    updateMarketPrice,
    getLiquiditySourceFromOracle,
    setOracleByName,
    setMarket,
    autoSelectOracleForMarket,
    getMarginSetting,
    setMarginSetting,
    openPosition,
    closePosition,
    placeOrder,
    cancelOrder,
    setLiquiditySourceEnabled,
    toggleLiquiditySource,

    // Storage management methods
    clearPositions: positionsStorage.clear,
    removePosition: positionsStorage.removePosition,
    removePositionsByMarket: positionsStorage.removePositionsByMarket,
    removePositionsByAccountId: positionsStorage.removePositionsByAccountId,
    removePositionsByChainId: positionsStorage.removePositionsByChainId,
    clearOrders: ordersStorage.clear,
    removeOrder: ordersStorage.removeOrder,
    removeOrdersByMarket: ordersStorage.removeOrdersByMarket,
    removeOrdersByAccountId: ordersStorage.removeOrdersByAccountId,
    removeOrdersByChainId: ordersStorage.removeOrdersByChainId,
  }
})
