<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="w-full max-w-[400px] max-h-[624px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl flex flex-col overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 class="text-base font-semibold leading-6 text-white m-0">Select Market</h3>
              <button
                @click="$emit('close')"
                class="text-white/70 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors hover:text-white"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-4 border-b border-gray-800">
              <div class="relative flex items-center">
                <svg class="absolute left-4 w-[18px] h-[18px] text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="w-full h-10 pl-11 pr-10 bg-gray-900 border border-transparent rounded-xl text-base leading-5 text-white transition-all placeholder:text-gray-400/75 hover:border-gray-800 focus:outline-none focus:border-gray-800"
                  placeholder="Search market..."
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute right-3 w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer text-gray-400 opacity-75 transition-opacity hover:opacity-100 z-10"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 p-4 border-b border-gray-800">
              <button
                v-for="tag in categoryTags"
                :key="tag.value"
                @click="selectedCategory = tag.value"
                class="border-none bg-transparent cursor-pointer p-0 transition-all"
              >
                <span
                  :class="[
                    'inline-block px-2 py-1.5 rounded-xl text-xs leading-4 font-medium text-white whitespace-nowrap transition-all',
                    selectedCategory === tag.value
                      ? 'bg-gray-800 border border-blue-500'
                      : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
                  ]"
                >
                  {{ tag.label }} <span v-if="tag.label === 'All'">({{ tag.count }})</span>
                </span>
              </button>
            </div>

            <div class="h-px mx-4 bg-gray-800"></div>

            <div class="flex-1 overflow-y-auto p-2 mx-2 mb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent hover:scrollbar-thumb-gray-700">
              <template v-if="filteredMarkets.length === 0">
                <div class="flex items-center justify-center py-10 px-4 min-h-[200px]">
                  <span class="text-sm leading-5 text-gray-400">No markets found</span>
                </div>
              </template>
              <button
                v-for="market in filteredMarkets"
                :key="market"
                @click="selectMarket(market)"
                :class="[
                  'w-full min-h-[60px] rounded-xl border-none bg-transparent cursor-pointer p-0 mb-2 relative transition-all last:mb-0',
                  selectedMarket === market
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 p-[1px]'
                    : 'hover:bg-gray-900'
                ]"
              >
                <div
                  :class="[
                    'w-full min-h-[60px] rounded-xl flex items-center justify-between transition-all px-4 py-2',
                    selectedMarket === market
                      ? 'bg-gray-950 border-none'
                      : 'bg-gray-900 border border-gray-800'
                  ]"
                >
                  <div class="flex items-center flex-1">
                    <span class="text-base font-semibold leading-6 text-white">{{ market }}</span>
                  </div>
                  <div class="flex items-end">
                    <span
                      v-if="marketPrices[market]"
                      :class="[
                        'text-sm leading-5 font-medium',
                        marketPrices[market].change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      ]"
                    >
                      {{ marketPrices[market].change24h >= 0 ? '+' : '' }}
                      {{ marketPrices[market].change24h.toFixed(2) }}%
                    </span>
                    <span v-else class="text-sm leading-5 font-medium text-gray-400">--</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import {
  AVAILABLE_MARKETS,
  PERP_MARKETS,
  MEME_MARKETS,
  FOREX_MARKETS,
  STOCKS_MARKETS,
} from '@/constants/markets'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const tradeStore = useTradeStore()

type CategoryType = 'All' | 'Perps' | 'Meme' | 'Forex' | 'Stocks'

const searchQuery = ref('')
const selectedCategory = ref<CategoryType>('All')

const selectedMarket = computed(() => tradeStore.selectedMarket)
const marketPrices = computed(() => tradeStore.marketPrices)

const availableMarkets = computed(() => [...AVAILABLE_MARKETS])

const marketCategories = computed<Record<CategoryType, string[]>>(() => {
  return {
    'All': availableMarkets.value,
    'Perps': [...PERP_MARKETS],
    'Meme': [...MEME_MARKETS],
    'Forex': [...FOREX_MARKETS],
    'Stocks': [...STOCKS_MARKETS]
  }
})

const categoryTags = computed(() => {
  return [
    { label: 'All', value: 'All' as CategoryType, count: availableMarkets.value.length },
    { label: 'Perps', value: 'Perps' as CategoryType, count: marketCategories.value['Perps'].length },
    { label: 'Meme', value: 'Meme' as CategoryType, count: marketCategories.value['Meme'].length },
    { label: 'Forex', value: 'Forex' as CategoryType, count: marketCategories.value['Forex'].length },
    { label: 'Stocks', value: 'Stocks' as CategoryType, count: marketCategories.value['Stocks'].length }
  ]
})

const filteredMarkets = computed(() => {
  const category = selectedCategory.value as CategoryType
  let markets = marketCategories.value[category] || availableMarkets.value
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    markets = markets.filter((market: string) => 
      market.toLowerCase().includes(query)
    )
  }
  
  return markets
})

function selectMarket(market: string) {
  tradeStore.selectedMarket = market
  emit('close')
}

function clearSearch() {
  searchQuery.value = ''
}

watch(() => props.show, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
    selectedCategory.value = 'All'
  }
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(31 41 55);
  border-radius: 3px;
}

.scrollbar-thin:hover::-webkit-scrollbar-thumb {
  background: rgb(55 65 81);
}
</style>

