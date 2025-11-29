# hp-fe-demo

### dev

```bash
pnpm install
sudo `which node` node_modules/.pnpm/vite@5.4.21_@types+node@22.19.1_sass@1.94.2/node_modules/vite/bin/vite.js --host 0.0.0.0 --port 80 --strictPort
curl http://heropath.local
```

### About four.meme

A spot market that deploys ERC20 tokens on BSC with constant totalSupply. There are 2 phases:

- Bonding Curve phase: Trade on four.meme platform, prices in BNB, wallet transfers restricted
- Graduation phase (≥18 BNB raised): Pool migrates to PancakeSwap. Trade on PancakeSwap only. API price unit transitions from BNB to USD as token matures

My thoughts:

- prevent negated position in paper trading simulator.
- Bonding Curve phase has a high risk. so current I chose markets that are Graduation phase. Token markets are hardcoded in `src/views/TcTestRemoveMeC-config.json`.
- Price unit behavior are different:

| Token Type          | Four.meme API Unit | K-line API Unit | WebSocket Unit |
| ------------------- | ------------------ | --------------- | -------------- |
| Bonding Curve phase | BNB                | BNB             | BNB            |
| Graduation phase    | USD                | BNB             | BNB            |

Recommended Flow:

1. Initial Load: Fetch token ticker (different definition, see the table) + BNB ticker (USD)
2. Display: Both USD and BNB versions of token price
3. TradingView Chart: Load BNB prices on-demand
4. WebSocket @TICKER_EVENT: Update BNB price
5. WebSocket @TOKEN_PRICE_EVENT@0: Update ALL tokens price in BNB. You can save them in a dict

#### API Endpoints

**REST APIs:**

- Token List (phase 2): https://four.meme/meme-api/v1/private/token/query?orderBy=BnTimeDesc&queryMode=Binance&tokenName=&listedPancake=true&pageIndex=1&pageSize=30&symbol=&labels=
- Token List (phase 1): ...listedPancake=false...
- Token Details by Address: https://four.meme/meme-api/v1/private/token/get?address={tokenAddress}

Response includes `tokenPrice` object with:

- `price`: see the table above
- `maxPrice`: all-time high price
- `increase`: price change percentage
- `marketCap`: market capitalization

**Ticker API (Get BNB/USD and other exchange rates):**

- Endpoint: `POST https://four.meme/meme-api/v1/public/ticker`
- Request body: `{}`
- Returns array of trading pairs with USD prices
- Example response:
  ```json
  [
    {"symbol": "BNBUSDT", "price": "880.65"},
    {"symbol": "CAKEUSDT", "price": "2.373"},
    ...
  ]
  ```
- Use `BNBUSDT` to convert BNB prices to USD

**WebSocket:**

- URL: `wss://ws.four.meme/ws`
- Connection Steps:
  1. Connect to websocket
  2. Subscribe to channels:
     ```json
     {"method":"BINARY","params":"true"}
     {"method":"SUBSCRIBE","params":"@TICKER_EVENT"} // we received message during test
     {"method":"SUBSCRIBE","params":"@TOKEN_PRICE_EVENT@0"} // we received message during test
     {"method":"SUBSCRIBE","params":"{tokenId}@TOKEN_EVENT@0"} // did not receive
     {"method":"SUBSCRIBE","params":"{tokenId}@BAR_EVENT-MIN5@0"} // did not receive
     ```
- Message Format (example):

  ```json
  {
    "event": "@TOKEN_PRICE_EVENT@0",
    "data": {
      "tokenId": 101287649,
      "price": "0.0000151825381948175", // always BNB
      "symbol": "BNB_MPC",
      "increase": "951.248795579",
      "marketCap": "15182.5381948175",
      "trading": "162.430165134835482374",
      "dayIncrease": "0.0035945409",
      "dayTrading": "15.675071442867064333"
    }
  }
  {
    "event": "@TICKER_EVENT",
    "data": {
      "symbol": "BNBUSDT",
      "price": "879.48"
    }
  }
  ```

- Binary vs Text Mode deliver identical message content

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
- Response includes OHLCV data in BNB price
- For tokens with `dexType: "PANCAKE_SWAP"`, this API returns PancakeSwap market prices (quote = BNB)
