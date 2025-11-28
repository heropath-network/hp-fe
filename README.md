# hp-fe-demo

### dev

```bash
pnpm install
pnpm dev
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
