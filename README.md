# Acurast On-Demand Oracle

## Overview

Youves utilizes the [Acurast oracles](https://github.com/acurast) for the price feeds of the synthetic assets.
The oracle scripts are the executables used by the processors to collect data in a verifiable way.

This script implements an on-demand oracle for cryptocurrency and forex price feeds. It's designed to work with the Acurast network, providing reliable and up-to-date price information for various asset pairs.
The prices are signed by the oracles, ready for on chain verification.

## Features

- Supports multiple cryptocurrency and forex pairs
- Fetches data from various reputable exchanges and APIs
- Implements a caching mechanism to reduce unnecessary API calls
- Calculates median prices to ensure accuracy
- Handles WebSocket connections for real-time price requests
- Includes error handling and logging via Sentry

## Supported Pairs

### Cryptocurrency

- BTCUSD, BTCUSDT
- XTZUSD, XTZUSDT
- USDTUSD

### Forex

- XAUUSD
- CHFUSD
- EURUSD

## Prerequisites

- Access to processors on the Acurast network
- API keys for various price feed sources (Twelve Data, One Forge, Currency API)

## Setup

1. Clone the repository
2. Install dependencies (if any)
3. Set up environment variables:
   - `WSS_URLS`: WebSocket URLs for Acurast network, separated by comma
   - `CACHE_EPOCH_CRYPTO`: Cache duration for crypto prices in seconds (default: 60 seconds)
   - `CACHE_EPOCH_FOREX`: Cache duration for forex prices in seconds (default: 300 seconds)
   - `TWELVEDATA_API_KEY`: API key for Twelve Data
   - `ONE_FORGE_API_KEY`: API key for One Forge
   - `CURRENCY_API_KEY`: API key for Currency API
   - `SENTRY_KEY`: Sentry API key for error logging (optional)

Crypto APIs are public but forex prices do require API keys.

## Usage

The script runs on an acurast processor and is listening for price requests via websocket. To use it:

1. Start the script
2. Connect to the WebSocket server
3. Send a price request in the following format:

```json
[
  { "from": "BTC", "to": "USD", "price": 50000 },
  { "from": "XTZ", "to": "USD", "price": 1.5 }
]
```

The price field is optional.
If a price is not provided in the request then the oracle will just asnwer with the price it fetched.

If you provide a price of your own the oracle will fetch prices and compare his price to the one you provided.
If the price difference is within the threshold then it will return your price as valid.
So if the oracle returns a different price from what you provided it means that price is not valid.

The return

The script will respond with price information, including signed prices for verification.

### Response Payload Structure

The oracle returns a JSON payload with the following structure:

```json
{
  "priceInfos": [
    {
      "from": "BTC",
      "to": "USD",
      "price": 50000000000,
      "epoch": 1689345600
    }
    // ... other price infos
  ],
  "signedPrices": [
    {
      "pair": "BTCUSD",
      "packedPrice": "0x...",
      "signature": "0x..."
    }
    // ... other signed prices
  ],
  "errors": [
    // Any error messages, if applicable
  ],
  "timeInfos": {
    "startTimestamp": 1689345610000,
    "endTimestamp": 1689345610500,
    "executionTime": 500
  },
  "version": "1.8"
}
```

- `priceInfos`: Array of price information for each requested pair.
- `signedPrices`: Array of packed and signed prices for on-chain verification.
- `errors`: Any error messages encountered during price fetching.
- `timeInfos`: Timestamps and execution time of the request.
- `version`: The version of the oracle script.

## Configuration

You can modify the following constants in the script to adjust its behavior:

- `MINIMUM_SOURCES_PER_PRICE`: Minimum number of sources required for a valid price
- `DEVIATION_THRESHOLD_PERCENT`: Maximum allowed deviation between prices (calculated with price difference)
- `TRADE_AGE_LIMIT`: Maximum age of trades to be considered valid

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License



## Disclaimer

This script is provided as-is. Please use it responsibly and in accordance with the terms of service of the various APIs it utilizes.
