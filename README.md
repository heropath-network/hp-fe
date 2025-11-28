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

- Token List (PancakeSwap listed tokens): https://four.meme/meme-api/v1/private/token/query?orderBy=BnTimeDesc&queryMode=Binance&tokenName=&listedPancake=true&pageIndex=1&pageSize=30&symbol=&labels=
- Token Details by Address: https://four.meme/meme-api/v1/private/token/get?address={tokenAddress}

Response includes `tokenPrice` object with:

- `price`: current price in USD
- `maxPrice`: all-time high price
- `increase`: price change percentage
- `marketCap`: market capitalization
