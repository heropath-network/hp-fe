const fs = require('fs');
const https = require('https');

const url = "https://four.meme/meme-api/v1/private/token/query?orderBy=BnTimeDesc&queryMode=Binance&tokenName=&listedPancake=true&pageIndex=1&pageSize=30&symbol=&labels=";

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      // Filter for dexType === "PANCAKE_SWAP" explicitly, even if listedPancake=true implies it.
      const pancakeSwapMarkets = json.data.filter(token => token.dexType === "PANCAKE_SWAP").map(token => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        baseToken: {
          symbol: "BNB", // Assuming BNB as base token for PancakeSwap pairs on BSC
          decimals: 18 // Common decimals for BNB
        },
        quoteToken: {
          symbol: token.symbol,
          decimals: 18 // Assuming 18 decimals for ERC20 tokens unless specified otherwise
        },
        currentPrice: token.tokenPrice.price // Use the actual price from the API
      }));

      const config = { markets: pancakeSwapMarkets };

      const outputPath = '/app/js-demo/hp-fe-demo/src/views/TcTestRemoveMeO-config.json';
      fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
      console.log(`Successfully wrote ${pancakeSwapMarkets.length} PancakeSwap markets to ${outputPath}`);

    } catch (e) {
      console.error("Error parsing JSON or writing file:", e);
    }
  });

}).on("error", (err) => {
  console.log("Error fetching markets: " + err.message);
});
