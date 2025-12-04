<template>
  <tr class="transition hover:bg-gray-700/50">
    <!-- Market Column -->
    <td class="px-4 py-6 relative">
      <div class="flex items-center gap-2">
        <MarketIcon :symbol="position.market" :size="24" />
        <div class="flex flex-col gap-1">
          <div class="text-[13px] leading-[18px] text-white font-normal">
            {{ position.market }}
          </div>
          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-block text-[13px]',
                position.side === 'long' ? 'text-green-success' : 'text-red-error'
              ]"
            >
              {{ position.side.charAt(0).toUpperCase() + position.side.slice(1) }}  {{ position.leverage }}x
            </span> 
            <ChainLabel :chain-id="position.chainId" :liquidity-source="position.liquiditySource" />
            <Tooltip :content="`Margin Ratio: ${marginRatioPercent.toFixed(2)}%`">
              <MarginRatioStatus :value="marginRatioPercent" />
            </Tooltip>
          </div>
        </div>
      </div>
    </td>
    
    
    <!-- Size Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ getPositionSizeUSD() }}
        </div>
        <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal whitespace-nowrap">
          {{ formatNumber(position.size, 4) }}
        </div>
      </div>
    </td>


    <!-- Collateral Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal whitespace-nowrap">
        {{ formatCurrency(position.collateral) }}
      </div>
    </td>
    
    <!-- Entry Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ formatNumber(position.entryPrice, 2) }}
        </div>
      </div>
    </td>
    
    <!-- Mark Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ getMarkPrice(position.market) }}
        </div>
      </div>
    </td>
    
    <!-- Liq. Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ formatNumber(position.liquidationPrice, 2) }}
      </div>
    </td>
    
    
    
    <!-- PnL Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            getPositionPnL() >= 0 ? 'text-green-success' : 'text-red-error'
          ]"
          :title="`Gross PnL: ${formatCurrency(pnlBreakdown.grossPnl)}\nFees: ${formatCurrency(pnlBreakdown.totalFees)}\nNet PnL: ${formatCurrency(pnlBreakdown.netPnl)}`"
        >
          {{ formatCurrency(getPositionPnL()) }}
        </div>
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            getPositionPnLPercent() >= 0 ? 'text-green-success' : 'text-red-error'
          ]"
        >
          {{ formatPnLPercentage(getPositionPnLPercent()) }}
        </div>
      </div>
    </td>
    
    <!-- Actions Column -->
    <td class="px-4 py-6 flex justify-center">
      <button
        @click="closePosition(position.id)"
        :disabled="signing"
        :class="[
          'flex items-center justify-center gap-1 bg-[#272727] px-[17px] py-2 transition',
          signing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#333333]'
        ]"
      >
        <!-- <svg class="w-4 h-4 text-[#ff4e59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg> -->
        <span class="text-[12px] leading-[16px] text-white font-medium text-center whitespace-nowrap">
            {{ signing ? 'Signing...' : 'Close' }}
        </span>
        <LoadingIcon v-if="signing" class="ml-1" :is-black="false" />
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, formatCurrency, fromBigInt } from '@/utils/bigint'
import { calculatePositionPnL, calculateTradeHistoryPnL } from '@/utils/pnl'
import type { Position, TradeHistory } from '@/storages/trading'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'
import MarginRatioStatus from '@/components/trade/MarginRatioStatus.vue'
import { useConnection, useSignTypedData, useChainId } from '@wagmi/vue'
import { useEvaluationAccount } from '@/composables/useEvaluationAccount'
import { useNotification } from '@/composables/useNotification'
import PositionFilledNotification from '@/components/Notification/PositionFilledNotification.vue'
import { LoadingIcon, Tooltip } from '@/components'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  position: Position
}>()

const tradeStore = useTradeStore()
const { address, isConnected } = useConnection()
const { signTypedDataAsync } = useSignTypedData()
const chainId = useChainId()
const { selectedEvaluationId } = useEvaluationAccount()
const notification = useNotification()
const signing = ref(false)

const { accountBalance, positions, totalPnL } = storeToRefs(tradeStore)

// Calculate cross margin ratio (account-level)
const accountValueUsd = computed(() => accountBalance.value + totalPnL.value)

function leverageToBigInt(value: number): bigint {
  const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
  return BigInt(normalized)
}

const totalPositionNotional = computed(() => {
  if (!positions.value.length) return BigInt(0)
  return positions.value.reduce((sum, pos) => sum + pos.collateral * leverageToBigInt(pos.leverage), BigInt(0))
})

const MAINTENANCE_MARGIN_RATE_BPS = BigInt(500)
const BPS_DENOMINATOR = BigInt(10000)

const maintenanceMarginUsd = computed(() => {
  if (totalPositionNotional.value === BigInt(0)) return BigInt(0)
  return (totalPositionNotional.value * MAINTENANCE_MARGIN_RATE_BPS) / BPS_DENOMINATOR
})

function percentOf(numerator: bigint, denominator: bigint): number {
  if (numerator === BigInt(0)) {
    return 0
  }
  if (denominator <= BigInt(0)) {
    return 100
  }
  const scaled = (numerator * BigInt(10000)) / denominator
  return Math.min(Number(scaled) / 100, 999)
}

const marginRatioPercent = computed(() => {
  if (maintenanceMarginUsd.value === BigInt(0)) return 0
  return percentOf(maintenanceMarginUsd.value, accountValueUsd.value)
})

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? formatNumber(BigInt(price), 2) : '0.00'
}

function getPositionSizeUSD(): string {
  // Position value in USD = collateral * leverage
  // This matches the calculation used in PnL and represents the notional position value
  const positionValue = props.position.collateral * BigInt(props.position.leverage)
  return formatCurrency(positionValue, 2).replace('$', '')
}

// Calculate comprehensive PnL with fees
const pnlBreakdown = computed(() => {
  const currentPrice = tradeStore.marketPrices[props.position.market]?.price || props.position.entryPrice
  
  // Ensure side is correctly passed - it should be 'long' or 'short'
  const side = props.position.side === 'short' ? 'short' : 'long'
  
  return calculatePositionPnL(
    props.position.entryPrice,
    currentPrice,
    side,
    props.position.size,
    props.position.leverage,
    props.position.collateral,
    props.position.timestamp,
    true // Include fees
  )
})

function getPositionPnL(): bigint {
  return pnlBreakdown.value.netPnl
}

function getPositionPnLPercent(): number {
  return pnlBreakdown.value.netPnlPercent
}

function formatPnLPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function getTimeframe(): string {
  // Calculate time since position was opened
  const now = Date.now()
  const opened = props.position.timestamp
  const diffMs = now - opened
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

/**
 * Requests signature for closing a position
 */
async function requestClosePositionSignature() {
  if (!address.value) {
    throw new Error('Wallet not connected')
  }

  const currentPrice = tradeStore.marketPrices[props.position.market]?.price || props.position.entryPrice
  const exitPrice = fromBigInt(currentPrice, 2)
  const baseAsset = props.position.market.split('/')[0] || ''
  const sizeFormatted = fromBigInt(props.position.size, 4)
  
  const messageLines = [
    'Trade Confirmation',
    'Action: Close Position',
    `Account: ${selectedEvaluationId.value ?? 'N/A'}`,
    `Market: ${props.position.market}`,
    `Side: ${props.position.side}`,
    `Size: ${sizeFormatted} ${baseAsset}`,
    `Entry Price: $${fromBigInt(props.position.entryPrice, 2)}`,
    `Exit Price: $${exitPrice}`,
    `Leverage: ${props.position.leverage}x`,
  ]

  const contents = `${messageLines.join('\n')}\n\n.`

  await signTypedDataAsync({
    types: {
      Person: [{ name: 'wallet', type: 'address' }],
      Trade: [
        { name: 'account', type: 'Person' },
        { name: 'action', type: 'string' },
        { name: 'market', type: 'string' },
        { name: 'side', type: 'string' },
        { name: 'orderType', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'price', type: 'string' },
        { name: 'triggerPrice', type: 'string' },
        { name: 'leverage', type: 'uint256' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Trade',
    message: {
      account: {
        wallet: address.value,
      },
      action: 'Close Position',
      market: props.position.market,
      side: props.position.side,
      orderType: 'market',
      size: sizeFormatted,
      price: exitPrice,
      triggerPrice: 'market',
      leverage: props.position.leverage,
      contents,
    },
  } as any)
}

/**
 * Closes a position with signing and notification
 * This calculates PnL and updates account balance, then removes from LocalStorage
 */
async function closePosition(positionId: string) {
  if (!isConnected.value || !address.value) {
    alert('Please connect your wallet first')
    return
  }

  signing.value = true

  try {
    await requestClosePositionSignature()
    
    const DURATION_SUCCESS_NOTIFICATION = 3000
    const DURATION_CLOSE_NOTIFICATION = DURATION_SUCCESS_NOTIFICATION + 2000

    // Get position data before closing
    const position = tradeStore.positions.find((p) => p.id === positionId)
    if (!position) {
      throw new Error('Position not found')
    }

    const currentPrice = tradeStore.marketPrices[position.market]?.price || position.entryPrice
    const currentLiquiditySource = tradeStore.getLiquiditySourceFromOracle(tradeStore.selectedOracle)
    const marginSetting = tradeStore.getMarginSetting(position.market)
    const marginMode = marginSetting.mode

    // Calculate PnL before closing (same calculation as in closePosition)
    const pnlBreakdown = calculateTradeHistoryPnL(
      position.entryPrice,
      currentPrice,
      position.side,
      position.size,
      position.leverage,
      position.collateral,
      position.timestamp,
      Date.now(),
      true, // Include fees
    )

    // Create trade history object for notification (matching what closePosition creates)
    const tradeHistory: TradeHistory = {
      id: position.id,
      accountId: position.accountId,
      market: position.market,
      side: position.side,
      size: position.size,
      entryPrice: position.entryPrice,
      exitPrice: currentPrice,
      pnl: pnlBreakdown.netPnl,
      collateral: position.collateral,
      leverage: position.leverage,
      timestamp: position.timestamp,
      closeTimestamp: Date.now(),
      chainId: position.chainId,
      liquiditySource: position.liquiditySource,
    }

    // Close the position (this updates storage)
    tradeStore.closePosition(positionId)

    // Show notification
    const notificationInstance = notification.create({
      content: PositionFilledNotification,
      props: {
        position: null,
        order: null,
        tradeHistory: tradeHistory,
        market: position.market,
        side: position.side,
        orderType: 'market',
        liquiditySource: currentLiquiditySource,
        marginMode: marginMode,
        actionType: 'close',
        fillPromise: new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, DURATION_SUCCESS_NOTIFICATION)
        }),
        onClose: () => {
          notificationInstance.destroy()
        },
      },
      duration: DURATION_CLOSE_NOTIFICATION,
    })
  } catch (error) {
    console.error('Close position signing failed:', error)
    // Don't close the position if signing failed
  } finally {
    signing.value = false
  }
}
</script>

