<template>
  <div class="meme-trade-form relative w-[343px] bg-[#1D1D1D]">
    <!-- Main Content Container -->
    <div class="relative left-[16px] pt-4 w-[311px] pb-4">
      <!-- Time Period Tabs (Buy / Long) -->
      <div class="bg-[#272727] flex ">
        <button
          @click="selectedPeriod = '1m'"
          :class="[
            'flex-1 flex flex-col gap-[4px] items-center justify-center px-0 py-[10px] text-[13px] text-center font-medium leading-[18px] transition',
            selectedPeriod === '1m' ? 'bg-[#373737]' : ''
          ]"
        >
          <div :class="selectedPeriod === '1m' ? 'text-white' : 'text-gray-400'">1m</div>
          <div class="text-[#9b9b9b]">0.00%</div>
        </button>
        <button
          @click="selectedPeriod = '5m'"
          :class="[
            'flex-1 flex flex-col gap-[4px] items-center justify-center px-0 py-[10px] text-[13px] text-center font-medium leading-[18px] transition',
            selectedPeriod === '5m' ? 'bg-[#373737]' : ''
          ]"
        >
          <div :class="selectedPeriod === '5m' ? 'text-white' : 'text-gray-400'">5m</div>
          <div class="text-green-success">+ 0.12%</div>
        </button>
        <button
          @click="selectedPeriod = '1h'"
          :class="[
            'flex-1 flex flex-col gap-[4px] items-center justify-center px-0 py-[10px] text-[13px] text-center font-medium leading-[18px] transition',
            selectedPeriod === '1h' ? 'bg-[#373737]' : ''
          ]"
        >
          <div :class="selectedPeriod === '1h' ? 'text-white' : 'text-gray-400'">1h</div>
          <div class="text-green-success">+ &lt;0.01%</div>
        </button>
        <button
          @click="selectedPeriod = '24h'"
          :class="[
            'flex-1 flex flex-col gap-[4px] items-center justify-center px-0 py-[10px] text-[13px] text-center font-medium leading-[18px] transition',
            selectedPeriod === '24h' ? 'bg-[#373737]' : ''
          ]"
        >
          <div :class="selectedPeriod === '24h' ? 'text-white' : 'text-gray-400'">24h</div>
          <div class="text-red-error">-1.85%</div>
        </button>
      </div>

      <!-- Divider -->
      <div class="bg-[#272727] h-px "></div>

      <!-- Market Stats Row -->
      <div class="flex items-center gap-0 mt-[16px] mb-[16px]">
        <div class="flex flex-col gap-[4px] w-[74px]">
          <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Vol</div>
          <div class="text-[#9B9B9B] text-[13px] leading-[18px] font-medium">$617.7K</div>
        </div>
        <div class="flex flex-col gap-[4px] items-center justify-center w-[90px]">
          <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Buys</div>
          <div class="flex text-[13px] leading-[18px] font-medium">
            <span class="text-green-success">1.16K</span>
            <span class="text-gray-400">/</span>
            <span class="text-green-success">$325K</span>
          </div>
        </div>
        <div class="flex flex-col gap-[4px] items-center justify-center w-[80px]">
          <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Sells</div>
          <div class="flex text-[13px] leading-[18px] font-medium">
            <span class="text-green-success">688</span>
            <span class="text-gray-400">/</span>
            <span class="text-green-success">$235K</span>
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-[4px] items-end">
          <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Net Buy</div>
          <div class="text-red-error text-[13px] leading-[18px] font-medium">-$229</div>
        </div>
      </div>

      <!-- Divider -->
      <div class="bg-[#272727] h-px w-[calc(100%+32px)] -ml-[16px]"></div>

      <!-- Trading Form Section -->
      <div class="flex flex-col gap-4 mt-4">
        <!-- Buy/Sell Tabs -->
        <div class="flex-1 bg-[#272727] flex">
          <button
            @click="tradeSide = 'buy'"
            :class="[
              'flex-1 items-center justify-center px-0 py-2 text-sm text-center font-medium transition',
              tradeSide === 'buy'
                ? 'bg-green-success text-gray-1000'
                : 'text-gray-400'
            ]"
          >
            Buy
          </button>
          <button
            @click="tradeSide = 'sell'"
            :class="[
              'flex-1 items-center justify-center px-0 py-2 text-sm text-center font-medium transition',
              tradeSide === 'sell'
                ? 'bg-red-error text-gray-1000'
                : 'text-gray-400'
            ]"
          >
            Sell
          </button>
        </div>

        <!-- Market Price and Order Type Row -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <!-- Market Price Input -->
            <div class="flex-1 relative">
              <div class="bg-[#272727] p-3 flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Market Price</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[18px] leading-[24px] text-[#9b9b9b] font-semibold">${{ selectedMarketPrice }}</span>
                </div>
              </div>
              <!-- Chain Label -->
              <SourceLiquidityLabel
                :oracle-name="selectedOracleName"
                class="top-0 right-0"
                />
            </div>

            <!-- Order Type Dropdown -->
            <div class="flex flex-1 flex-col gap-1 justify-center">
              <div class="relative w-full order-type-dropdown">
                <button
                  @click.stop="showOrderTypeMenu = !showOrderTypeMenu"
                  class="w-full bg-[#272727] p-3 flex flex-col gap-2"
                >
                  <div class="flex items-center justify-end">
                    <span class="text-[13px] leading-[18px] text-[#9b9b9b] text-right">Order Type</span>
                  </div>
                  <div class="flex items-center justify-end gap-1">
                    <span class="text-[16px] leading-[24px] text-white font-medium text-right">{{ orderType.charAt(0).toUpperCase() + orderType.slice(1) }}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </button>
                <div v-if="showOrderTypeMenu" class="absolute top-full mt-1 w-full bg-[#272727] z-50 border border-[#373737]">
                  <button
                    v-for="type in ['market', 'limit', 'stop']"
                    :key="type"
                    @click.stop="orderType = type as any; showOrderTypeMenu = false"
                    class="w-full px-3 py-2 text-left text-[16px] leading-[24px] text-white font-medium hover:bg-[#373737] transition"
                  >
                    {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Buy Amount Input -->
          <div class="flex flex-col gap-2">
            <div class="bg-[#272727] p-3 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <span class="text-[13px] leading-[18px] text-[#9b9b9b]">{{ tradeSide === 'buy' ? 'Buy' : 'Sell' }}</span>
                </div>
                <span class="text-[13px] leading-[18px] text-[#9b9b9b] text-right">Balance: 1.88</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 flex items-center">
                  <input
                    v-model="buyAmount"
                    type="text"
                    inputmode="decimal"
                    class="w-full bg-transparent text-[18px] leading-[24px] text-white font-semibold outline-none"
                    placeholder="0.0"
                  />
                </div>
                <div class="flex items-center gap-1 justify-end cursor-pointer">
                  <MarketIcon :symbol="'BNB/USD'" :size="20"/>
                  <span class="text-[16px] leading-[24px] text-white font-medium text-right">BNB</span>
                </div>
              </div>
              <!-- Quick Selection Buttons -->
              <div class="flex gap-2 h-8 ">
                <button
                  @click="selectQuickAmount('0.01')"
                  :class="[
                    'quick-selection-btn flex-1 flex h-8 items-center justify-center px-4 py-0 cursor-pointer transition',
                    selectedQuickAmount === '0.01' ? 'quick-selection-btn-selected' : 'quick-selection-btn-default'
                  ]"
                >
                  <span :class="[
                    'text-[14px] leading-[20px] font-medium transition',
                    selectedQuickAmount === '0.01' ? 'text-green-success' : 'text-[#9b9b9b]'
                  ]">0.01</span>
                </button>
                <button
                  @click="selectQuickAmount('0.02')"
                  :class="[
                    'quick-selection-btn flex-1 flex h-8 items-center justify-center px-4 py-0 cursor-pointer transition',
                    selectedQuickAmount === '0.02' ? 'quick-selection-btn-selected' : 'quick-selection-btn-default'
                  ]"
                >
                  <span :class="[
                    'text-[14px] leading-[20px] font-medium transition',
                    selectedQuickAmount === '0.02' ? 'text-green-success' : 'text-[#9b9b9b]'
                  ]">0.02</span>
                </button>
                <button
                  @click="selectQuickAmount('0.05')"
                  :class="[
                    'quick-selection-btn flex-1 flex h-8 items-center justify-center px-4 py-0 cursor-pointer transition',
                    selectedQuickAmount === '0.05' ? 'quick-selection-btn-selected' : 'quick-selection-btn-default'
                  ]"
                >
                  <span :class="[
                    'text-[14px] leading-[20px] font-medium transition',
                    selectedQuickAmount === '0.05' ? 'text-green-success' : 'text-[#9b9b9b]'
                  ]">0.05</span>
                </button>
                <button
                  @click="selectQuickAmount('1')"
                  :class="[
                    'quick-selection-btn flex-1 flex h-8 items-center justify-center px-4 py-0 cursor-pointer transition',
                    selectedQuickAmount === '1' ? 'quick-selection-btn-selected' : 'quick-selection-btn-default'
                  ]"
                >
                  <span :class="[
                    'text-[14px] leading-[20px] font-medium transition',
                    selectedQuickAmount === '1' ? 'text-green-success' : 'text-[#9b9b9b]'
                  ]">1</span>
                </button>
                <button
                  @click="handleEditClick"
                  class="quick-selection-btn bg-[#373737] flex h-8 items-center justify-center px-2 py-0 cursor-pointer transition hover:bg-[#404040]"
                >
                <img :src="editIcon" alt="Edit" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Exchange Rate -->
        <div class="flex items-center justify-between ">
          <span class="text-[13px] leading-[18px] text-[#9b9b9b]">
            1 BNB ≈ {{ formattedAmountInOneBnb }} {{ selectedMarketName }}
          </span>
          <img :src="bnbSettingIcon" alt="Copy" class="w-[16px] h-[16px]" />
        </div>

        <!-- Advanced Trading Strategy -->
        <div class="flex flex-col gap-[12px] ">
          <div class="flex items-center ">
            <button
              @click="advancedTradingStrategyEnabled = !advancedTradingStrategyEnabled"
              class="flex gap-[8px] items-center cursor-pointer"
            >
              <div class="relative w-4 h-4">
                <div
                  :class="[
                    'absolute inset-0 transition flex justify-center items-center',
                    advancedTradingStrategyEnabled ? 'bg-green-success' : 'bg-[#373737] border border-[#545454]'
                  ]"
                ></div>
                <div
                  v-if="advancedTradingStrategyEnabled"
                  class="flex justify-center items-center relative w-4 h-4"
                >
                  <img :src="checkIcon" alt="Check" class="w-3 h-3" />
                </div>
              </div>
              <div class="flex flex-col">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Advanced Trading Strategy</div>
              </div>
            </button>
          </div>
          <div v-if="advancedTradingStrategyEnabled" class="flex flex-col gap-[8px] ">
            <!-- TP/SL Rows -->
            <div
              v-for="(entry, index) in tpSlEntries"
              :key="index"
              class="flex gap-[8px] items-center "
            >
              <div class="bg-[#272727] flex-1 flex gap-[4px] items-center px-[8px] py-[7px] text-[13px]">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">TP</div>
                <input
                  v-model.number="entry.tp"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  min="0"
                  max="100"
                  class="flex-1 text-right text-white text-[13px] leading-[18px] font-medium bg-transparent outline-none border-none"
                  placeholder="0"
                />
                <div class="text-[#9b9b9b] text-right text-[13px] leading-[18px]">%</div>
              </div>
              <div class="bg-[#272727] flex-1 flex gap-[4px] items-center px-[8px] py-[7px] text-[13px]">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Sell</div>
                <input
                  v-model.number="entry.sl"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  min="0"
                  max="100"
                  class="flex-1 text-right text-white text-[13px] leading-[18px] font-medium bg-transparent outline-none border-none"
                  placeholder="0"
                />
                <div class="text-[#9b9b9b] text-right text-[13px] leading-[18px]">%</div>
              </div>
              <img
                :src="removeIcon"
                alt="Remove"
                class="w-[16px] h-[16px] cursor-pointer"
                @click="removeTpSlEntry(index)"
              />
            </div>
            <!-- Warning Message -->
            <div class="bg-[rgba(255,177,16,0.1)] flex-1 items-center px-[8px] py-[7px]">
              <div class="flex-1 text-[#ffb110] text-[13px] text-center font-medium leading-[18px]">
                100% SL required to exit fully
              </div>
            </div>
            <!-- Add Button -->
            <button
              @click="addTpSlEntry"
              class="border border-[#373737] border-solid flex gap-[4px] items-center justify-center px-[8px] py-[7px] w-[310px] cursor-pointer hover:bg-[#373737] transition"
            >
              <img :src="addIcon" alt="Add" class="w-[16px] h-[16px]" />
              <div class="text-[#9b9b9b] text-[13px] text-center font-medium leading-[18px]">Add</div>
            </button>
          </div>
        </div>

        <!-- Enter Amount Button -->
        <div 
            class="bg-green-success flex items-center justify-center px-0 py-[14px]" 
            :class="buyAmount ? 'cursor-pointer' : 'opacity-50'"
        >
          <span v-if="!buyAmount"  class="text-gray-1000 text-sm text-center font-medium leading-5">Enter an amount</span>
          <span v-else class="text-gray-1000 text-sm text-center font-medium leading-5">{{ tradeSide === 'buy' ? 'Buy' : 'Sell' }}</span>
        </div>

        <!-- Settings Section -->
        <div class="flex flex-col gap-[12px] ">
          <div class="flex items-center justify-between ">
            <div class="flex gap-[8px] items-center">
              <div class="flex gap-[4px] items-center">
                <img :src="slippageIcon" alt="Gas" class="w-[16px] h-[16px]" />
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">{{slippageCustom ? slippageCustom : 'Auto'}}</div>
              </div>
              <div class="flex gap-[4px] items-center">
                <img :src="gasIcon" alt="Gas" class="w-[16px] h-[16px]" />
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">0.12</div>
              </div>
              <div class="flex gap-[4px] items-center">
                <img :src="burgerIcon" alt="On" class="w-[16px] h-[16px]" />
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">ON</div>
              </div>
            </div>
            <i 
              @click="showSettings = !showSettings"
              :class="[
                'iconfont icon-down text-[#9b9b9b] text-[16px] transform transition-transform cursor-pointer',
                showSettings ? 'rotate-180' : ''
              ]"
            ></i>
          </div>
          <div v-if="showSettings" class="flex flex-col gap-[8px] outline-none" tabindex="-1">
            <!-- Slippage -->
            <div class="flex items-center justify-between ">
              <div class="flex flex-col">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Slippage</div>
              </div>
              <div class="flex gap-[8px] w-[168px]">
                <div class="bg-[#272727] flex-1 flex items-center justify-center px-[8px] py-[7px]">
                  <div class="flex-1 text-[#6CE99E] text-[13px] text-center font-medium leading-[18px]" :class="!!slippageCustom ? '' : 'text-[#6CE99E]'">Auto 7.5%</div>
                </div>
                <div class="bg-[#272727] flex-1 flex gap-[4px] items-center px-[8px] py-[7px] text-[13px]">
                  <input
                    v-model="slippageCustom"
                    type="text"
                    inputmode="decimal"
                    class="flex-1 text-white text-[13px] leading-[18px] font-medium bg-transparent outline-none border-none placeholder:text-[#545454] max-w-[49px]"
                    placeholder="Custom"
                  />
                  <div class="text-[#9b9b9b] text-right text-[13px] leading-[18px]">%</div>
                </div>
              </div>
            </div>
            <!-- Max Auto Gas -->
            <div class="flex items-center justify-between ">
              <div class="flex flex-col">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Max Auto Gas</div>
              </div>
              <div class="flex gap-[8px] w-[168px]">
                <div class="bg-[#272727] flex-1 flex items-center justify-center px-[8px] py-[7px]">
                  <div class="flex-1 text-[#6CE99E] text-[13px] text-center font-medium leading-[18px]">Avg 0.12</div>
                </div>
                <div class="bg-[#272727] flex-1 flex items-center px-[8px] py-[7px]">
                  <input
                    v-model="maxAutoGas"
                    type="text"
                    inputmode="decimal"
                    class="flex-1 text-white text-[13px] leading-[18px] font-medium bg-transparent outline-none border-none placeholder:text-[#545454] max-w-[64px]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <!-- Max Auto Gas (Gwei) -->
            <div class="flex items-center justify-between ">
              <div class="flex flex-col">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px] border-b border-dotted border-[#9b9b9b] border-opacity-30">Max Auto Gas</div>
              </div>
              <div class="bg-[#272727] flex items-center justify-end gap-[4px] px-[8px] py-[7px] w-[168px]">
                <input
                  v-model="maxAutoGasGwei"
                  type="text"
                  inputmode="decimal"
                  class="flex-1 text-white text-[13px] leading-[18px] font-medium bg-transparent outline-none border-none text-right placeholder:text-[#545454] "
                  placeholder="0"
                />
                <div class="text-[#545454] text-[13px] text-right font-medium leading-[18px]">Gwei</div>
              </div>
            </div>
            <!-- Anti-MEV RPC -->
            <div class="flex items-center justify-between ">
              <div class="text-[#9b9b9b] text-[13px] leading-[18px] text-right">Anti-MEV RPC</div>
              <Switch v-model:enabled="antiMevRpcEnabled" />
            </div>
            <!-- Auto Approval -->
            <div class="flex items-center justify-between ">
              <div class="flex flex-col">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Auto Approval</div>
              </div>
              <Switch v-model:enabled="autoApprovalEnabled" />
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="bg-[#272727] h-px  mt-[16px]"></div>

      <!-- Token Information Section -->
      <div class="flex flex-col gap-[8px] mt-[16px]">
        <div class="flex items-center relative ">
          <div class="flex flex-col gap-[4px] w-[74px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Top 10</div>
            <div class="flex gap-[4px] items-center">
              <img :src="closedIcon" alt="Warning" class="w-[16px] h-[16px]" />
              <div class="text-red-error text-[13px] leading-[18px] font-medium">87.81%</div>
            </div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[90px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">DEV</div>
            <div class="flex gap-[4px] items-center">
              <img :src="cookIcon" class="w-[16px] h-[16px]" />
              <div class="text-green-success text-[13px] leading-[18px] font-medium">0%</div>
              <i class="iconfont icon-bnb text-white text-[14px]"></i>
            </div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[80px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Holders</div>
            <div class="text-white text-[13px] leading-[18px] font-medium">20,776</div>
          </div>
          <div class="flex-1 flex flex-col gap-[4px] items-end">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Snipers</div>
            <div class="flex gap-[4px] items-center">
                <img :src="goalIcon" class="w-[16px] h-[16px]" />
              <div class="text-green-success text-[13px] leading-[18px] font-medium">0%</div>
            </div>
          </div>
        </div>
        <div class="flex items-center relative ">
          <div class="flex flex-col gap-[4px] w-[74px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Insiders</div>
            <div class="text-green-success text-[13px] leading-[18px] font-medium">0%</div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[90px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Phishing</div>
            <div class="text-red-error text-[13px] leading-[18px] font-medium">93.3%</div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[80px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Bundler</div>
            <div class="text-green-success text-[13px] leading-[18px] font-medium">0.1%</div>
          </div>
          <div class="flex-1 flex flex-col gap-[4px] items-end">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Dex Paid</div>
            <div class="flex gap-[4px] items-center -ml-4">
              <img :src="birdIcon" class="w-[16px] h-[16px]" />
              <div class="text-white text-[13px] leading-[18px] font-medium whitespace-nowrap">$698 CTO</div>
            </div>
          </div>
        </div>
        <div class="flex items-center relative ">
          <div class="flex flex-col gap-[4px] w-[74px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">NoHoneypot</div>
            <div class="flex h-[18px] items-center">
                <img :src="acceptedIcon" class="w-[16px] h-[16px]" />
            </div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[90px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Verified</div>
            <div class="flex h-[18px] items-center">
                <img :src="acceptedIcon" class="w-[16px] h-[16px]" />
            </div>
          </div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-[80px]">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Renounced</div>
            <div class="flex h-[18px] items-center">
                <img :src="acceptedIcon" class="w-[16px] h-[16px]" />
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-[4px] items-end">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Locked</div>
            <div class="text-white text-[13px] leading-[18px] font-medium">🔥</div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="bg-[#272727] h-px  mt-[16px]"></div>

      <!-- Pool Info Section -->
      <div class="flex flex-col gap-[16px] mt-[16px]">
        <div class="flex flex-col gap-[12px] ">
          <div class="flex items-center justify-between ">
            <div class="flex gap-[4px] items-center">
              <div class="text-white text-[14px] leading-[20px] font-semibold">{{ selectedMarketName }}/WBNB Pool Info</div>
              <i class="iconfont icon-down text-[#9b9b9b] text-[16px] transform rotate-180"></i>
            </div>
            <img :src="scanIcon" alt="Scan" class="w-[16px] h-[16px]" />
          </div>
          <div class="flex flex-col gap-[8px] ">
            <div class="flex justify-between ">
              <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Total liq</div>
              <div class="text-white text-[13px] leading-[18px]">$1.6M (928.42 WBNB) 🔥</div>
            </div>
            <div class="flex items-center ">
              <div class="flex-1 flex flex-col gap-[4px]">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Pair</div>
                <div class="flex flex-col text-white text-[13px] leading-[18px] font-medium">
                  <div>{{ selectedMarketName }}</div>
                  <div>WBNB</div>
                </div>
              </div>
              <div class="flex-1 flex flex-col gap-[4px] items-center justify-center">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Liq/Initial</div>
                <div class="flex flex-col items-center justify-center">
                  <div class="flex text-white text-[13px] leading-[18px] font-medium">
                    <div>6.8K</div>
                    <div class="text-[#9b9b9b]">/</div>
                    <div class="text-[#9b9b9b]">0 (0)</div>
                  </div>
                  <div class="flex text-white text-[13px] leading-[18px] font-medium">
                    <div>982.42</div>
                    <div class="text-[#9b9b9b]">/</div>
                    <div class="text-[#9b9b9b]">0</div>
                  </div>
                </div>
              </div>
              <div class="flex-1 flex flex-col gap-[4px] items-end">
                <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Value</div>
                <div class="flex flex-col items-end text-white text-[13px] leading-[18px] font-medium">
                  <div>$810.2K</div>
                  <div>$816.3K</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="bg-[#272727] h-px "></div>

        <!-- DEV and Funding -->
        <div class="flex flex-col gap-[8px] ">
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">DEV</div>
            <div class="flex gap-[8px] items-center">
              <div class="flex gap-[4px] items-center">
                <div class="text-white text-[13px] leading-[18px] underline">0x32...2866 (0BNB)</div>
                <img :src="copyIcon" class="w-[16px] h-[16px] cursor-pointer" />
              </div>
              <img :src="notCookIcon" class="w-[16px] h-[16px] cursor-pointer" />
              <img :src="searchIcon" class="w-[16px] h-[16px] cursor-pointer" />
              <img :src="scanIcon" class="w-[14px] h-[14px] cursor-pointer" />
            </div>
          </div>
          <div class="flex justify-between ">
            <div class="flex flex-col">
              <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Funding</div>
            </div>
            <div class="flex gap-[8px] items-center">
              <div class="flex gap-[4px] items-center">
                <img :src="darkBnbIcon" class="w-[14px] h-[14px]" />
                <div class="text-white text-[13px] leading-[18px] underline">0xbd...0774</div>
              </div>
              <div class="flex gap-[4px] items-center">
                <MarketIcon :symbol="'BNB/USD'" :size="14" />
                <div class="text-white text-[13px] leading-[18px]">3.17</div>
              </div>
              <div class="text-white text-[13px] leading-[18px] underline">68d</div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="bg-[#272727] h-px "></div>

        <!-- Market Cap, Holders, etc. -->
        <div class="flex flex-col gap-[8px] ">
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Market Cap</div>
            <div class="text-white text-[13px] leading-[18px] text-right">$119.11M</div>
          </div>
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Holders</div>
            <div class="text-white text-[13px] leading-[18px] text-right">20778</div>
          </div>
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Total Supply</div>
            <div class="text-white text-[13px] leading-[18px] text-right">1M</div>
          </div>
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Pair</div>
            <div class="flex gap-[4px] items-center">
              <div class="text-white text-[13px] leading-[18px] text-right">0xd6..1d57</div>
              <img :src="copyIcon" class="w-[16px] h-[16px] cursor-pointer" />
            </div>
          </div>
          <div class="flex justify-between ">
            <div class="text-[#9b9b9b] text-[13px] leading-[18px]">Pool Created</div>
            <div class="text-white text-[13px] leading-[18px] text-right">09/22/2025 00:15:59</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Switch from '@/components/Switch.vue'
import SourceLiquidityLabel from '@/components/common/SourceLiquidityLabel.vue'
import { useTradeStore } from '@/stores/tradeStore'
import { useBnbUsdPrice } from '@/packages/gains'
import { fromBigInt } from '@/utils/bigint'
import editIcon from '@/assets/icons/edit.svg'
import MarketIcon from '@/components/common/MarketIcon.vue'
import bnbSettingIcon from '@/assets/icons/bnb-settings.svg'
import addIcon from '@/assets/icons/add.svg'
import burgerIcon from '@/assets/icons/burger.svg'
import gasIcon from '@/assets/icons/gas.svg'
import removeIcon from '@/assets/icons/remove.svg'
import slippageIcon from '@/assets/icons/slippage.svg'
import checkIcon from '@/assets/icons/check.svg'
import acceptedIcon from '@/assets/icons/accepted.svg'
import birdIcon from '@/assets/icons/bird.svg'
import closedIcon from '@/assets/icons/closed.svg'
import cookIcon from '@/assets/icons/cook.svg'
import copyIcon from '@/assets/icons/copy.svg'
import darkBnbIcon from '@/assets/icons/dark-bnb.svg'
import goalIcon from '@/assets/icons/goal.svg'
import notCookIcon from '@/assets/icons/not-cook.svg'
import scanIcon from '@/assets/icons/scan.svg'
import searchIcon from '@/assets/icons/search.svg'




const tradeStore = useTradeStore()
const selectedOracleName = computed(() => tradeStore.currentOracleName)
const selectedMarket = computed(() => tradeStore.selectedMarket)
const selectedMarketName = computed(() => selectedMarket.value.split('/')[0] || 'GIGGLE')
const selectedMarketPrice = computed(() => parseFloat(fromBigInt(tradeStore.currentMarketPrice, 8)).toFixed(8))

// BNB price in USD
const { price: bnbUsdPrice } = useBnbUsdPrice()

// Calculate amount of selected market in 1 BNB
const amountInOneBnb = computed(() => {
  const bnbPrice = bnbUsdPrice.value
  const marketPriceBigInt = tradeStore.currentMarketPrice
  
  if (!bnbPrice || bnbPrice <= 0 || !marketPriceBigInt || marketPriceBigInt === BigInt(0)) {
    return null
  }
  
  // Convert market price from bigint (18 decimals) to number
  const marketPriceUsd = parseFloat(fromBigInt(marketPriceBigInt, 18))
  
  if (marketPriceUsd <= 0) {
    return null
  }
  
  // Calculate: 1 BNB = (BNB price in USD) / (market price in USD) units of the selected market
  const amount = bnbPrice / marketPriceUsd
  return amount
})

const formattedAmountInOneBnb = computed(() => {
    if (amountInOneBnb.value && amountInOneBnb.value > 1000) {
        return (amountInOneBnb.value / 1000).toFixed(2) + 'K'
    }
    return amountInOneBnb.value?.toFixed(2) || '--'
})

// Time period selection
const selectedPeriod = ref<'1m' | '5m' | '1h' | '24h'>('1m')

// Trade side selection
const tradeSide = ref<'buy' | 'sell'>('buy')

// Order type selection
const orderType = ref<'market' | 'limit' | 'stop'>('market')
const showOrderTypeMenu = ref(false)

// Switch states
const antiMevRpcEnabled = ref(true)
const autoApprovalEnabled = ref(false)

// Settings section visibility
const showSettings = ref(false)

// Settings input values
const slippageCustom = ref('')
const maxAutoGas = ref('2')
const maxAutoGasGwei = ref('')

// Advanced Trading Strategy checkbox
const advancedTradingStrategyEnabled = ref(false)

// Watch checkbox to ensure at least one entry when enabled
watch(advancedTradingStrategyEnabled, (enabled) => {
  if (enabled && tpSlEntries.value.length === 0) {
    tpSlEntries.value.push({ tp: null, sl: null })
  }
})

// Buy amount input
const buyAmount = ref('')

// TP/SL entries
interface TpSlEntry {
  tp: number | null
  sl: number | null
}

const tpSlEntries = ref<TpSlEntry[]>([
  { tp: null, sl: null }
])

// Add new TP/SL entry
function addTpSlEntry() {
  tpSlEntries.value.push({ tp: null, sl: null })
}

// Remove TP/SL entry
function removeTpSlEntry(index: number) {
  tpSlEntries.value.splice(index, 1)
  // If removing the last entry, uncheck the checkbox
  if (tpSlEntries.value.length === 0) {
    advancedTradingStrategyEnabled.value = false
    // Re-add one empty entry when checkbox is unchecked
    tpSlEntries.value.push({ tp: null, sl: null })
  }
}

// Quick selection buttons - saved to localStorage
const selectedQuickAmount = useLocalStorage<'0.01' | '0.02' | '0.05' | '1' | null>(
  'meme-trade:selected-quick-amount',
  null
)

// Track if update is from button click to avoid clearing selection
let isUpdatingFromButton = false

// Handle quick amount selection
function selectQuickAmount(amount: '0.01' | '0.02' | '0.05' | '1') {
  isUpdatingFromButton = true
  selectedQuickAmount.value = amount
  buyAmount.value = amount
}

// Handle edit button click (could open a custom input dialog or focus the input)
function handleEditClick() {
  // Focus the input field or could open a custom dialog
  const input = document.querySelector('input[type="text"][inputmode="decimal"]') as HTMLInputElement
  if (input) {
    input.focus()
  }
  // Clear selection when editing manually
  selectedQuickAmount.value = null
}


// Watch for manual input changes - clear selection if user types a different value
watch(buyAmount, (newValue) => {
  if (isUpdatingFromButton) {
    isUpdatingFromButton = false
    return
  }
  
  // If user manually changes the input and it doesn't match the selected quick amount, clear selection
  if (selectedQuickAmount.value && newValue !== selectedQuickAmount.value) {
    selectedQuickAmount.value = null
  }
})

// Close order type menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.order-type-dropdown')) {
    showOrderTypeMenu.value = false
  }
}

onMounted(() => {
    selectedQuickAmount.value = null
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    selectedQuickAmount.value = null
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Default state for quick selection buttons */
.quick-selection-btn-default {
  background-color: #373737;
}

.quick-selection-btn-default:hover {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(90deg, rgba(55, 55, 55, 1) 0%, rgba(55, 55, 55, 1) 100%);
}

.quick-selection-btn-default:hover span {
  color: white;
}

/* Selected state for quick selection buttons */
.quick-selection-btn-selected {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(90deg, rgba(55, 55, 55, 1) 0%, rgba(55, 55, 55, 1) 100%);
}

.quick-selection-btn-selected span {
  color: #6ce99e; /* green-success */
}
</style>