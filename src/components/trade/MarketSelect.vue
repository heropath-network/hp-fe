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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
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
          <div class="w-full max-w-[400px] max-h-[624px] bg-[#1d1d1d] shadow-2xl flex flex-col overflow-hidden">
            <div class="flex h-14 items-center justify-between px-4 py-4">
              <h3 class="text-base font-semibold leading-6 text-white m-0">Select Market</h3>
              <button
                @click="$emit('close')"
                class="text-white bg-transparent border-none cursor-pointer p-0 flex items-center justify-center transition-opacity hover:opacity-75 h-4 w-4"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4L4 12M4 4L12 12" />
                </svg>
              </button>
            </div>

            <div class="px-4 pb-4">
              <div class="relative flex items-center gap-2 bg-[#272727] px-4 py-2">
                <i class="iconfont icon-search text-[18px] text-[#9B9B9B]"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="flex-1 bg-transparent border-none outline-none text-base leading-6 text-white placeholder:text-[#9B9B9B] placeholder:opacity-75"
                  placeholder="Search Market"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="w-4 h-4 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#9b9b9b] opacity-75 transition-opacity hover:opacity-100 shrink-0"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="px-4 pb-4">
              <div class="flex flex-wrap gap-2">
                <CategoryTag
                  v-for="tag in categoryTags"
                  :key="tag.value"
                  :active="selectedCategory === tag.value"
                  @click="selectedCategory = tag.value"
                >
                  {{ tag.label }} <span>({{ tag.count }})</span>
                </CategoryTag>
              </div>
            </div>

            <div class="h-px bg-[#272727]"></div>

            <div class="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
              <template v-if="sortedMarkets.length === 0">
                <div class="flex items-center justify-center py-10 px-4 min-h-[200px]">
                  <span class="text-sm leading-5 text-[#9b9b9b]">No markets found</span>
                </div>
              </template>
              <div class="flex flex-col gap-2">
                <div
                  v-for="market in sortedMarkets"
                  :key="market"
                  @click="selectMarket(market)"
                  class="w-full flex items-center gap-4 px-4 py-[7px] bg-[#272727] border cursor-pointer transition-all"
                  :class="[
                    selectedMarket === market
                      ? 'border-[#6ce99e]'
                      : 'border-transparent hover:border-[#373737]'
                  ]"
                >
                  <button
                    @click.stop="toggleFavorite(market)"
                    class="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    <i class="iconfont icon-mark" v-show="isFavorite(market)"></i>
                    <i class="iconfont icon-mark-unselected" v-show="!isFavorite(market)"></i>
                  </button>
                  <MarketIcon :symbol="market" :size="32" />
                  <div class="flex flex-col items-start justify-center flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="text-base font-semibold leading-6 text-white whitespace-nowrap">{{ market }}</span>
                      <div
                        v-if="shouldShowQuestionMark(market)"
                        class="relative h-[13px] w-[13px] shrink-0"
                      >
                        <img
                          src="@/assets/icons/question.svg"
                          alt="Info"
                          class="h-full w-full"
                        />
                      </div>
                    </div>
                    <span class="text-sm leading-5 text-[#9b9b9b] whitespace-nowrap">{{ getMarketName(market) }}</span>
                  </div>
                  <div class="flex flex-col items-end justify-center text-right whitespace-nowrap shrink-0">
                    <span
                      v-if="isMarketClosed(market)"
                      class="text-base font-semibold leading-6 text-[#9b9b9b]"
                    >
                      Market Closed
                    </span>
                    <span
                      v-else-if="marketPrices[market]"
                      class="text-base font-semibold leading-6 text-white"
                    >
                      {{ formatSmallPrice(marketPrices[market].price) }}
                    </span>
                    <span v-else class="text-base font-semibold leading-6 text-[#9b9b9b]">--</span>
                    <span
                      v-if="isMarketClosed(market)"
                      class="text-sm leading-5 font-normal text-[#9b9b9b]"
                    >
                      --
                    </span>
                    <span
                      v-else-if="marketPrices[market] && market24hRates[market] !== undefined"
                      :class="[
                        'text-sm leading-5 font-normal',
                        market24hRates[market] >= 0 ? 'text-[#10c8a8]' : 'text-[#ff4e59]'
                      ]"
                    >
                      {{ market24hRates[market] >= 0 ? '+' : '' }}
                      {{ market24hRates[market].toFixed(2) }}%
                    </span>
                    <span v-else class="text-sm leading-5 font-normal text-[#9b9b9b]">--</span>
                  </div>
                </div>
              </div>
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
  FOREX_MARKETS,
  STOCKS_MARKETS,
  CRYPTO_MARKETS,
  FOUR_MEME_MARKETS,
} from '@/constants/markets'
import MarketIcon from '@/components/common/MarketIcon.vue'
import CategoryTag from '@/components/common/CategoryTag.vue'
import { isFavorite, toggleFavorite } from '@/utils/favorites'
import { getMarketName } from '@/utils/marketNames'
import { useMarketStatus } from '@/composables/useMarketStatus'
import { useMarket24hRates } from '@/composables/useMarket24hRates'
import { formatSmallPrice } from '@/utils/bigint'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const tradeStore = useTradeStore()
const marketStatus = useMarketStatus()

type CategoryType = 'All' | 'Perps' | 'Meme' | 'Forex' | 'Stocks'

const searchQuery = ref('')
const selectedCategory = ref<CategoryType>('All')

const selectedMarket = computed(() => tradeStore.selectedMarket)
const marketPrices = computed(() => tradeStore.marketPrices)

function isMarketClosed(market: string): boolean {
  return marketStatus.checkMarketClosed(market)
}

const availableMarkets = computed(() => [...AVAILABLE_MARKETS])

const { rates: market24hRates, startAutoRefresh, stopAutoRefresh } = useMarket24hRates(availableMarkets, {
  autoRefresh: false,
  onMounted: false,
})

const marketCategories = computed<Record<CategoryType, string[]>>(() => {
  return {
    'All': availableMarkets.value,
    'Perps': [...PERP_MARKETS],
    'Meme': [ ...FOUR_MEME_MARKETS],
    'Forex': [...FOREX_MARKETS],
    'Stocks': [...STOCKS_MARKETS],
  }
})

const categoryTags = computed(() => {
  return [
    { label: 'All', value: 'All' as CategoryType, count: availableMarkets.value.length },
    { label: 'Perps', value: 'Perps' as CategoryType, count: marketCategories.value['Perps'].length },
    { label: 'Meme', value: 'Meme' as CategoryType, count: marketCategories.value['Meme'].length },
    { label: 'Forex', value: 'Forex' as CategoryType, count: marketCategories.value['Forex'].length },
    { label: 'Stocks', value: 'Stocks' as CategoryType, count: marketCategories.value['Stocks'].length },
  ]
})

const filteredMarkets = computed(() => {
  const category = selectedCategory.value as CategoryType
  let markets = marketCategories.value[category] || availableMarkets.value
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    markets = markets.filter((market: string) => 
      market.toLowerCase().includes(query) || getMarketName(market).toLowerCase().includes(query)
    )
  }
  
  return markets
})

const sortedMarkets = computed(() => {
  const markets = [...filteredMarkets.value]
  
  function getCategoryOrder(market: string): number {
    if (CRYPTO_MARKETS.includes(market as any)) return 1
    if (FOREX_MARKETS.includes(market as any)) return 2
    if (STOCKS_MARKETS.includes(market as any)) return 3
    if (FOUR_MEME_MARKETS.includes(market as any)) return 4
    return 5
  }
  
  return markets.sort((a, b) => {
    const aIsFavorite = isFavorite(a)
    const bIsFavorite = isFavorite(b)
    
    // Favorites first
    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    
    // Then by category
    const aCategory = getCategoryOrder(a)
    const bCategory = getCategoryOrder(b)
    if (aCategory !== bCategory) {
      return aCategory - bCategory
    }
    
    // Then alphabetically
    return a.localeCompare(b)
  })
})

function selectMarket(market: string) {
  tradeStore.setMarket(market)
  emit('close')
}

function clearSearch() {
  searchQuery.value = ''
}

function shouldShowQuestionMark(market: string): boolean {
  return FOREX_MARKETS.includes(market as any) || STOCKS_MARKETS.includes(market as any)
}

watch(() => props.show, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
    selectedCategory.value = 'All'
    stopAutoRefresh()
  } else {
    startAutoRefresh()
  }
}, { immediate: true })
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #373737;
  border-radius: 4px;
  opacity: 0.5;
}

.scrollbar-thin:hover::-webkit-scrollbar-thumb {
  background: #373737;
  opacity: 1;
}

button .iconfont {
  font-size: 16px;
}

button .iconfont.icon-mark {
  color: #FFB110;
}

button .iconfont.icon-mark-unselected {
  color: #9b9b9b;
}

button:hover .iconfont.icon-mark-unselected {
  color: #FFB110;
}
</style>
