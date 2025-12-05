# HeroPath Frontend

HeroPath - Decentralized User-Empowering Prop Trading

## Overview

HP Frontend is the user-facing layer of the HeroPath prop trading ecosystem. It provides trader evaluation, training education, paper trading simulation, and integration with BNB Chain ecosystem protocols and other needed networks.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             HeroPath                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                     ┌───────────────────────────────────┐               │
│                     │    HP Frontend (This Module)      │               │
│                     │                                   │               │
│   New Trader ──────►│  ┌─────────────────────────┐      │               │
│                     │  │     Evaluation Test     │◄──┐  │               │
│                     │  └───────────┬─────────────┘   │  │               │
│                     │              │                 │  │               │
│                     │      ┌───────┴───────┐         │  │               │
│                     │      ▼               ▼         │  │               │
│                     │   ┌──────┐       ┌────────┐    │  │               │
│                     │   │ PASS │       │  FAIL  │    │  │               │
│                     │   └──┬───┘       └───┬────┘    │  │               │
│                     │      │               │         │  │               │
│                     │      ▼               ▼         │  │               │
│                     │  Hero Account    Training      │  │               │
│                     │      │           Education     │  │               │
│                     │      │               │         │  │               │
│                     │      │          Re-evaluate ───┘  │               │
│                     └──────┼────────────────────────────┘               │
│                            │                                            │
│                            ▼                                            │
│              Contribute Trading Signals                                 │
│                            │                                            │
│                            ▼                                            │
│                   ┌─────────────────┐                                   │
│                   │   HP Contract   │                                   │
│                   │   (Aggregator)  │                                   │
│                   └─────────────────┘                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── api/           # API clients
├── components/    # Reusable Vue components
├── composables/   # Vue composition API hooks
├── config/        # App configuration
├── constants/     # Constants and enums
├── router/        # Vue Router configuration
├── stores/        # Pinia state management
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── views/         # Page components
```

## Dependencies

- Vue 3 `^3.5.11` - Progressive JavaScript framework
- Vue Router `^4.4.5` - Official router for Vue.js
- Pinia `^2.1.7` - Intuitive state management
- Wagmi Vue `^0.4.2` - Vue hooks for Ethereum
- Viem `~2.40.3` - TypeScript Ethereum library
- WalletConnect `~2.21.10` - Multi-wallet connection protocol
- Tailwind CSS `^3.4.13` - Utility-first CSS framework
- Headless UI `^1.7.23` - Unstyled accessible components
- Jazzicon `^2.0.0` - Wallet address identicons
- TanStack Query `^5.92.0` - Async state management
- VueUse `^14.1.0` - Collection of Vue composition utilities
- Axios `^1.13.2` - HTTP client
- Paho MQTT `^1.1.0` - MQTT client for WebSocket connections
- Vite `^5.4.10` - Next-gen frontend tooling
- TypeScript `^5.6.3` - Type-safe JavaScript
- Sass `^1.80.5` - CSS preprocessor
- TradingView ChartingLibrary is not open source, we leave an empty vendor directory

## Deployment

```bash
pnpm install

vite
```
