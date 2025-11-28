# hp-fe-demo

### dev

```bash
pnpm install
sudo `which node` node_modules/.pnpm/vite@5.4.21_@types+node@22.19.1_sass@1.94.2/node_modules/vite/bin/vite.js --host 0.0.0.0 --port 80 --strictPort
curl http://heropath.local
```

### About four.meme

A spot market that deploys ERC20 tokens on BSC with constant totalSupply. Tokens trade on the platform and then transfer to PancakeSwap after certain conditions. We shall choose the tokens after pancake stage.

CAUTION: prevent negated position in paper trading simulator.

#### API Endpoints

Token markets are hardcoded in `src/views/TcTestRemoveMeC-config.json`. But you can check API as a start point.

**REST APIs:**

- Token List (PancakeSwap listed tokens): https://four.meme/meme-api/v1/private/token/query?orderBy=BnTimeDesc&queryMode=Binance&tokenName=&listedPancake=true&pageIndex=1&pageSize=30&symbol=&labels=
- Token Details by Address: https://four.meme/meme-api/v1/private/token/get?address={tokenAddress}

Response includes `tokenPrice` object with:

- `price`: current price in USD
- `maxPrice`: all-time high price
- `increase`: price change percentage
- `marketCap`: market capitalization

**WebSocket:**

- URL: `wss://ws.four.meme/ws`
- Connection Steps:
  1. Connect to websocket
  2. Send `{"method":"BINARY","params":"false"}` to disable binary mode
  3. Subscribe to events
- Available Subscriptions:
  ```json
  {"method":"SUBSCRIBE","params":"@TICKER_EVENT"}
  {"method":"SUBSCRIBE","params":"@TOKEN_PRICE_EVENT@0"}
  {"method":"SUBSCRIBE","params":"{tokenId}@TOKEN_EVENT@0"}
  {"method":"SUBSCRIBE","params":"{tokenId}@BAR_EVENT-MIN5@0"}
  ```
- Message Format (example):
  ```json
  {
    "event": "@TOKEN_PRICE_EVENT@0",
    "data": {
      "tokenId": 101287649,
      "price": "0.0000151825381948175",
      "symbol": "BNB_MPC",
      "increase": "951.248795579",
      "marketCap": "15182.5381948175",
      "trading": "162.430165134835482374",
      "dayIncrease": "0.0035945409",
      "dayTrading": "15.675071442867064333"
    }
  }
  ```

**Historical Bars API:**

- Endpoint: `POST https://four.meme/meme-api/v1/public/bar/new`
- Request body:
  ```json
  {
    "tokenId": "100049371",
    "typeEnum": "MIN5",
    "pageSize": 98,
    "endDate": 1763899500000,
    "symbol": "ORIGINAL",
    "isAve": false
  }
  ```
- Available bar types: MIN1, MIN5, MIN15, HOUR1, HOUR4, DAY1
- Response includes OHLCV data

#### Test Pages

**`/tc-test-c` - Four.meme Market Test Page**

Features:

- Market selector (7 PancakeSwap-listed tokens)
- Real-time price updates via WebSocket
- WebSocket connection status indicator
- Update counter
- Debug log panel with filtered events
- TradingView Charting Library integration with historical data

Implementation:

- Token config: `src/views/TcTestRemoveMeC-config.json`
- Each token requires: `id`, `tokenId`, `symbol`, `name`, `address`
- `tokenId` obtained from API response `id` field
- WebSocket filters messages by `tokenId` for selected market
- Price displayed with 10 decimal precision
- Shows 24h change percentage in logs
- Auto-reconnects when switching markets

TradingView Integration:

- Datafeed implementation: `src/views/TcTestRemoveMeC-datafeed.ts`
- Supported timeframes: 1m, 5m, 15m, 1h, 4h, 1D
- Chart updates automatically when switching markets
- Dark theme, auto-sizing
- Charting library: `public/charting_library` → `vendor/charting_library/charting_library` (symlink)
