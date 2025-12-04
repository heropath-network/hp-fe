export interface FourMemeMarket {
  id: string
  tokenId: number
  symbol: string
  name: string
  address: string
  icon: string
}

export const FOUR_MEME_MARKETS: FourMemeMarket[] = [
  {
    id: 'PALU',
    tokenId: 100672058,
    symbol: 'PALU',
    name: 'Palu',
    address: '0x02e75d28a8aa2a0033b8cf866fcf0bb0e1ee4444',
    icon: 'https://static.four.meme/market/ab6c70e6-d0b0-4bff-9c7b-2bbf6b266f1d15673547050693917762.jpg',
  },
  {
    id: 'WEIRD',
    tokenId: 101353338,
    symbol: 'WEIRD',
    name: 'Weird Coin',
    address: '0x444489335e11d29b41135d3d744c44ba72272772',
    icon: 'https://static.four.meme/market/b52deba7-3868-4dd2-a4ec-d4fae1f37e98317958565726639973.png',
  },
  {
    id: 'BOL',
    tokenId: 101323611,
    symbol: 'BOL',
    name: 'BNBOFLEGENDS',
    address: '0x44444e15232ff6dfed49b550d672707a283b3910',
    icon: 'https://static.four.meme/market/95c60017-75ef-421d-97b6-cf7af39d6cc717242359875201347402.png',
  },
  {
    id: 'RCHV',
    tokenId: 101305256,
    symbol: 'RCHV',
    name: 'Archivas',
    address: '0x44442271e6ca7336a29032838d70675680adc7df',
    icon: 'https://static.four.meme/market/d3978919-3531-439f-bf8e-fafe46206b8111331067267598277646.png',
  },
  {
    id: 'gm',
    tokenId: 101221973,
    symbol: 'gm',
    name: 'gm',
    address: '0x4444b33f8d84f37c08b9487ff2efb8c908496b34',
    icon: 'https://static.four.meme/market/19b63136-8aaa-4f3b-b563-679c6c023a4716248337556721371595.jpeg',
  },
  {
    id: 'Bibi',
    tokenId: 101342925,
    symbol: 'Bibi',
    name: 'Binance AI',
    address: '0x444437716c563a0604b63319caa754016568e66e',
    icon: 'https://static.four.meme/market/1c9b5fac-75b1-4b0b-a934-8732a8089a258924462948781461196.png',
  },
  {
    id: 'AIF',
    tokenId: 101273998,
    symbol: 'AIF',
    name: 'AIfluence House',
    address: '0x4444202f285c188690780f6cdc5f6c27767a8ee2',
    icon: 'https://static.four.meme/market/8b3e063d-0652-4352-9549-6ffbd2e1b6e15804309161987839532.jpeg',
  },
]

export const FOUR_MEME_API_BASE_URL = 'https://four.meme/meme-api/v1'
export const FOUR_MEME_WS_URL = 'wss://ws.four.meme/ws'


