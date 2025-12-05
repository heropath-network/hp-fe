<template>
  <tr class="transition hover:bg-gray-700/50">
    <!-- Market & Side Column -->
    <td class="px-4 py-6 relative flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <MarketIcon :symbol="order.market" :size="24" />
        <div class="flex flex-col gap-1">
          <div class="text-[13px] leading-[18px] text-white">
            {{ order.market }}
          </div>
          <div class="flex items-center gap-2">
            <span :class="['inline-block text-[13px]',  order.side === 'long' ? 'text-green-success' : 'text-red-error']">
              {{ order.side.charAt(0).toUpperCase() + order.side.slice(1) }}
            </span> 
            <ChainLabel :chain-id="order.chainId" :liquidity-source="order.liquiditySource" />
          </div>
        </div>
      </div>
    </td>
    
    <!-- Operation & Type Column -->
    <td class="px-4 py-6">
      <div class="flex flex-col gap-1">
      <span>Open Position</span>
        <span class="inline-block text-[13px] text-[#9B9B9B]">
          {{ order.orderType === 'limit' ? 'Limit Order' : 'Open Market' }}
        </span>
      </div>
    </td>
    

    <!-- Est. Fill Price Column -->
    <td class="px-4 py-6 text-left">
      <div class="text-[13px] leading-[18px] text-white">
        {{ order.orderType === 'limit' && order.side === 'long' ? '≤' : '≥' }}
        ${{ formatNumber(order.triggerPrice, 2) }}
      </div>
    </td>
    
    <!-- Amount Column -->
    <td class="px-4 py-6 text-left">
      <div class="text-[13px] leading-[18px] text-white">
        {{ formatNumber(order.size, 4) }} {{ order.market.split('/')[0] }}
      </div>
    </td>
    
    
    <!-- Margin Column -->
    <td class="px-4 py-6 text-left">
      <div class="text-[13px] leading-[18px] text-white flex flex-col gap-1">
        <span>--</span>
        <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Cross</span>
      </div>
    </td>
    
    <!-- Actions Column -->
    <td class="px-4 py-6 flex justify-center">
      <button
        @click="cancelOrder(order.id)"
        :disabled="signing"
        :class="[
          'flex items-center justify-center gap-1 bg-[#272727] px-4 py-2 transition',
          signing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#333333]'
        ]"
      >
        <span class="text-[12px] leading-[16px] text-white font-medium text-center whitespace-nowrap">
          {{ signing ? 'Signing...' : 'Cancel' }}
        </span>
        <LoadingIcon v-if="signing" class="ml-1" :is-black="false" />
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, fromBigInt } from '@/utils/bigint'
import type { Order } from '@/storages/trading'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'
import { useConnection, useSignTypedData } from '@wagmi/vue'
import { useEvaluationAccount } from '@/composables/useEvaluationAccount'
import { useNotification } from '@/composables/useNotification'
import PositionFilledNotification from '@/components/Notification/PositionFilledNotification.vue'
import { LoadingIcon } from '@/components'

const props = defineProps<{
  order: Order
}>()

const tradeStore = useTradeStore()
const { address, isConnected } = useConnection()
const { signTypedDataAsync } = useSignTypedData()
const { selectedEvaluationId } = useEvaluationAccount()
const notification = useNotification()
const signing = ref(false)

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? formatNumber(BigInt(price), 2) : '0.00'
}

function getTimeframe(): string {
  // Calculate time since order was created
  const now = Date.now()
  const created = props.order.timestamp
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/**
 * Requests signature for canceling an order
 */
async function requestCancelOrderSignature() {
  if (!address.value) {
    throw new Error('Wallet not connected')
  }

  const baseAsset = props.order.market.split('/')[0] || ''
  const sizeFormatted = fromBigInt(props.order.size, 4)
  const triggerPriceFormatted = fromBigInt(props.order.triggerPrice, 2)
  
  const messageLines = [
    'Trade Confirmation',
    'Action: Cancel Order',
    `Account: ${selectedEvaluationId.value ?? 'N/A'}`,
    `Market: ${props.order.market}`,
    `Side: ${props.order.side}`,
    `Order Type: ${props.order.orderType}`,
    `Size: ${sizeFormatted} ${baseAsset}`,
    `Trigger Price: $${triggerPriceFormatted}`,
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
      action: 'Cancel Order',
      market: props.order.market,
      side: props.order.side,
      orderType: props.order.orderType,
      size: sizeFormatted,
      price: triggerPriceFormatted,
      triggerPrice: triggerPriceFormatted,
      leverage: 1, // Orders don't have leverage, but signature requires it
      contents,
    },
  } as any)
}

/**
 * Cancels an order with signing and notification
 * This removes the order from LocalStorage via tradeStore.cancelOrder()
 */
async function cancelOrder(orderId: string) {
  if (!isConnected.value || !address.value) {
    alert('Please connect your wallet first')
    return
  }

  signing.value = true

  try {
    await requestCancelOrderSignature()
    
    const DURATION_SUCCESS_NOTIFICATION = 3000
    const DURATION_CLOSE_NOTIFICATION = DURATION_SUCCESS_NOTIFICATION + 2000

    // Get order data before canceling
    const order = tradeStore.orders.find((o) => o.id === orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    const currentLiquiditySource = tradeStore.getLiquiditySourceFromOracle(tradeStore.selectedOracle)
    const marginSetting = tradeStore.getMarginSetting(order.market)
    const marginMode = marginSetting.mode

    // Show notification with fill Promise
    const notificationInstance = notification.create({
      content: PositionFilledNotification,
      props: {
        position: null,
        order: order,
        market: order.market,
        side: order.side,
        orderType: order.orderType,
        liquiditySource: currentLiquiditySource,
        marginMode: marginMode,
        actionType: 'cancel',
        fillPromise: new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
            // This automatically saves to LocalStorage via useUserOrdersStorage
            tradeStore.cancelOrder(orderId)
          }, DURATION_SUCCESS_NOTIFICATION)
        }),
        onClose: () => {
          notificationInstance.destroy()
        },
      },
      duration: DURATION_CLOSE_NOTIFICATION,
    })
  } catch (error) {
    console.error('Cancel order signing failed:', error)
    // Don't cancel the order if signing failed
  } finally {
    signing.value = false
  }
}
</script>

