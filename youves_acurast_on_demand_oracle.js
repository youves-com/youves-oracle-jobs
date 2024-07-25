const VERSION = '1.8'

//read the environment variables from ENV and have a default value if not set
const WSS_URLS_STRING =
  _STD_.env['WSS_URLS'] ||
  'wss://websocket-proxy-1.prod.gke.acurast.com,wss://websocket-proxy-2.prod.gke.acurast.com'
const WSS_URLS = WSS_URLS_STRING.split(',')

// Minimum sources needed for a valid price
const MINIMUM_SOURCES_PER_PRICE = {
  crypto: 3,
  forex: 2,
}
const PRICE_PRECISION = 10 ** 6

const DEVIATION_THRESHOLD_PERCENT = 0.05

// Trades from the APIs older than N minutes are not valid
const TRADE_AGE_LIMIT = 5 * 60 * 1000 // 5 min

// The length of the epoch for the cache. The cache is valid for the current epoch,
// and the price for that epoch has always the same timestamp (start of epoch)
// epochs are alawys fixed i.e for 30 seconds (12:00:00, 12:00:30, 12:01:00, ...),
const CACHE_EPOCH_CRYPTO = _STD_.env['CACHE_EPOCH_CRYPTO'] || 60 * 1 // ENV settable crypto cache, default 1 min
const CACHE_EPOCH_FOREX = _STD_.env['CACHE_EPOCH_FOREX'] || 60 * 5 // ENV settable forex cache, default 5 min

// Caching mechanism
// The cache is valid for the current epoch
const priceCache = {}

// Supported pairs
const CRYPTO_PAIRS = ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'XTZUSDT', 'USDTUSD']
const FOREX_PAIRS = ['XAUUSD', 'CHFUSD', 'EURUSD']

// ==== CRYPTO ====
//BTC USD 6 sources
//BTC USDT 13 sources
//XTZ USD 5 sources
//XTZ USDT 11 sources
//USDT USD 7 sources

const COINBASE_TEMPLATE = `https://api.pro.coinbase.com/products/<<FROM>>-<<TO>>/trades?limit=1`
const GEMINI_TEMPLATE = `https://api.gemini.com/v1/trades/<<FROM>><<TO>>?limit_trades=1`
const BITFINEX_TEMPLATE = `https://api-pub.bitfinex.com/v2/trades/t<<FROM>><<TO>>/hist?limit=1&sort=-1`
const KRAKEN_TEMPLATE = `https://api.kraken.com/0/public/Trades?pair=<<FROM>><<TO>>&count=1`
const CRYPTO_COM_TEMPLATE = `https://api.crypto.com/exchange/v1/public/get-trades?instrument_name=<<FROM>>_<<TO>>&count=1`
const BINANCE_US_TEMPLATE = `https://api.binance.us/api/v3/trades?symbol=<<FROM>><<TO>>&limit=1`
const BINANCE_TEMPLATE = `https://api.binance.com/api/v3/trades?symbol=<<FROM>><<TO>>&limit=1`
const BYBIT_TEMPLATE = `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=<<FROM>><<TO>>&limit=1`
const KUCOIN_TEMPLATE = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=<<FROM>>-<<TO>>`
const GATE_IO_TEMPLATE = `https://api.gateio.ws/api/v4/spot/trades/?currency_pair=<<FROM>>_<<TO>>&limit=1`
const HTX_TEMPLATE = `https://api.huobi.pro/market/trade?symbol=<<FROM>><<TO>>`
const MEXC_TEMPLATE = `https://api.mexc.com/api/v3/trades?symbol=<<FROM>><<TO>>&limit=1`
const WHITEBIT_TEMPLATE = `https://whitebit.com/api/v4/public/trades/<<FROM>>_<<TO>>`

// ==== FOREX ====
const TWELVEDATA_API_TEMPLATE = `https://api.twelvedata.com/exchange_rate?symbol=<<FROM>>/<<TO>>&apikey=<<API_KEY>>`
const ONE_FORGE_TEMPLATE = `https://api.1forge.com/convert?from=<<FROM>>&to=<<TO>>&quantity=1&api_key=<<API_KEY>>`
const CURRENCY_API_TEMPLATE = `https://currencyapi.net/api/v1/convert?&from=<<FROM>>&to=<<TO>>&amount=1&output=JSON&key=<<API_KEY>>`

//API configs
//the configs are used to fetch data from the exchanges
//each api has different answers so we configure each api to extract price data from the response

const CONFIGS = [
  {
    name: 'Binance US',
    exchange_id: 'BNU',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 4
      const priceIndex = 1

      let priceData = Object.values(Object.values(data)[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return BINANCE_US_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Binance',
    exchange_id: 'BNC',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 4
      const priceIndex = 1

      let priceData = Object.values(Object.values(data)[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return BINANCE_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Coinbase',
    exchange_id: 'CBP',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 4
      const priceIndex = 3

      let priceData = Object.values(data[0])
      priceData[timestampIndex] = new Date(priceData[timestampIndex]).valueOf()

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return COINBASE_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Bitfinex',
    exchange_id: 'BFX',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'XTZUSDT', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 1
      const priceIndex = 3

      let priceData = data[0]

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      from = from == 'USDT' ? 'UST' : from
      to = to == 'USDT' ? 'UST' : to

      return BITFINEX_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Kraken',
    exchange_id: 'KRK',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'XTZUSDT', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1000
      const timestampIndex = 2
      const priceIndex = 0

      let priceData = Object.values(data['result'])[0][0]
      priceData[timestampIndex] = Math.floor(priceData[timestampIndex])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return KRAKEN_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Bybit',
    exchange_id: 'BYB',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 5
      const priceIndex = 2

      let priceData = Object.values(data['result']['list'][0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return BYBIT_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Gemini',
    exchange_id: 'GEM',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 1
      const priceIndex = 3

      let priceData = Object.values(data[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return GEMINI_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Kucoin',
    exchange_id: 'KUC',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 0
      const priceIndex = 2

      let priceData = Object.values(data['data'])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return KUCOIN_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Gate IO',
    exchange_id: 'GIO',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1000
      const timestampIndex = 1
      const priceIndex = 6

      let priceData = Object.values(data[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return GATE_IO_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Crypto.com',
    exchange_id: 'CRY',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSD', 'XTZUSDT', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 3
      const priceIndex = 1

      let priceData = Object.values(data['result']['data'][0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return CRYPTO_COM_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'HTX',
    exchange_id: 'HTX',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 1
      const priceIndex = 4

      let priceData = Object.values(data['tick']['data'][0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return HTX_TEMPLATE.replace('<<FROM>>', from.toLowerCase()).replace(
        '<<TO>>',
        to.toLowerCase()
      )
    },
  },
  {
    name: 'MEXC',
    exchange_id: 'MEXC',
    type: 'crypto',
    availablePairs: ['BTCUSDT', 'XTZUSDT'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 4
      const priceIndex = 1

      let priceData = Object.values(data[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return MEXC_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Whitebit',
    exchange_id: 'WBIT',
    type: 'crypto',
    availablePairs: ['BTCUSD', 'BTCUSDT', 'XTZUSDT', 'USDTUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 100
      const timestampIndex = 4
      const priceIndex = 1

      let priceData = Object.values(data[0])

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return WHITEBIT_TEMPLATE.replace('<<FROM>>', from).replace('<<TO>>', to)
    },
  },
  {
    name: 'Twelve Data API',
    exchange_id: '12D',
    type: 'forex',
    availablePairs: ['XAUUSD', 'CHFUSD', 'EURUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1000
      const timestampIndex = 2
      const priceIndex = 1

      let priceData = Object.values(data)

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return TWELVEDATA_API_TEMPLATE.replace('<<FROM>>', from)
        .replace('<<TO>>', to)
        .replace('<<API_KEY>>', _STD_.env['TWELVEDATA_API_KEY'])
    },
  },
  {
    name: 'One Forge',
    exchange_id: '1FR',
    type: 'forex',
    availablePairs: ['XAUUSD', 'CHFUSD', 'EURUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1
      const timestampIndex = 2
      const priceIndex = 0

      let priceData = Object.values(data)

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return ONE_FORGE_TEMPLATE.replace('<<FROM>>', from)
        .replace('<<TO>>', to)
        .replace('<<API_KEY>>', _STD_.env['ONE_FORGE_API_KEY'])
    },
  },
  {
    name: 'Currency API',
    exchange_id: 'CAP',
    type: 'forex',
    availablePairs: ['XAUUSD', 'CHFUSD', 'EURUSD'],
    extractPriceData: (data) => {
      const timestampFactor = 1000
      const timestampIndex = 1
      const priceIndex = 2

      let priceData = Object.values(data)
      priceData[priceIndex] = priceData[priceIndex]['result']

      return {
        timestamp: priceData[timestampIndex] * timestampFactor,
        price: parseFloat(priceData[priceIndex]),
      }
    },
    constructURL: (from, to) => {
      return CURRENCY_API_TEMPLATE.replace('<<FROM>>', from)
        .replace('<<TO>>', to)
        .replace('<<API_KEY>>', _STD_.env['CURRENCY_API_KEY'])
    },
  },
]

//Get the start of the current n seconds epoch
function getEpochStart(intervalSeconds) {
  let now = new Date()
  let secondsSinceStartOfHour = now.getMinutes() * 60 + now.getSeconds()
  let intervalStart =
    secondsSinceStartOfHour - (secondsSinceStartOfHour % intervalSeconds)
  let startMinutes = Math.floor(intervalStart / 60)
  let startSeconds = intervalStart % 60
  now.setMinutes(startMinutes, startSeconds, 0)
  return Math.floor(now.valueOf() / 1000) // Convert milliseconds to seconds
}

//fetch data from the exchange
const fetch = (config, from, to) => {
  return new Promise((resolve, reject) => {
    httpGET(
      config.constructURL(from, to),
      {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36',
      },
      (rawResponse, certificate) => {
        let response = JSON.parse(rawResponse)
        // Extract data from the exchange specific response format
        const priceData = config.extractPriceData(response)
        console.log(
          'priceData ' + config.exchange_id,
          priceData.timestamp,
          priceData.price,
          certificate
        )
        resolve({ ...priceData, certificate: certificate })
      },
      (errorMessage) => {
        reject(errorMessage)
      }
    )
  })
}


//the percent differentce is a measure of how much two values differ
const percentDifference = (a, b) => {
  return Math.abs((a - b) / ((a + b) / 2)) * 100
}

const median = (values) => {
  values.sort((a, b) => a - b)

  const middleIndex = Math.floor(values.length / 2)

  if (values.length % 2 === 0) {
    const middleValue1 = values[middleIndex]
    const middleValue2 = values[middleIndex - 1]

    const deviation = percentDifference(middleValue1, middleValue2)

    //if there are only two values and the deviation is too high, return NaN
    if (values.length === 2 && deviation > DEVIATION_THRESHOLD_PERCENT) {
      return NaN
    } else {
      return (middleValue1 + middleValue2) / 2.0
    }
  } else {
    return values[middleIndex]
  }
}

const normalize = (value) => {
  return Math.round(value * PRICE_PRECISION)
}

// Fetch price for a specific pair
const fetchPrice = (from, to) => {
  //Check pair whitelist
  if (!CRYPTO_PAIRS.includes(from + to) && !FOREX_PAIRS.includes(from + to)) {
    console.log('Pair not supported')
    return Promise.reject(new Error(`${from}-${to} Pair not supported.`))
  }
  const pairType = CRYPTO_PAIRS.includes(from + to) ? 'crypto' : 'forex'

  const epochStart =
    pairType === 'crypto'
      ? getEpochStart(CACHE_EPOCH_CRYPTO)
      : getEpochStart(CACHE_EPOCH_FOREX)
  const cacheKey = '' + from + to
  // Check if the cache is existing and valid for the current epoch
  if (priceCache[cacheKey] && priceCache[cacheKey].epoch === epochStart) {
    console.log('returning from cache')
    return Promise.resolve(priceCache[cacheKey])
  }

  console.log('Fetching price for pair: ' + from + to)

  // Fetch prices from all sources
  // filter by pair type (crypto or forex)
  // filter by USD availability
  const promises = CONFIGS.filter((config) => config.type === pairType)
    .filter((config) => config.availablePairs.includes(from + to))
    .flatMap((config) => fetch(config, from, to))

  return Promise.allSettled(promises).then((results) => {
    const fulfilledPricedata = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .filter((priceData) => {
        // Filter out trades that are too old
        const tradeAgeLimit = TRADE_AGE_LIMIT
        const tradeAge = Date.now() - priceData.timestamp
        return tradeAge < tradeAgeLimit
      })

    const fulfilledPrices = fulfilledPricedata
      .map((priceData) => priceData.price)
      .filter((price) => price !== undefined)
      .filter((price) => price !== null)

    const certificates = fulfilledPricedata.map(
      (priceData) => priceData.certificate
    )

    print(JSON.stringify(fulfilledPrices))
    console.log('fulfilledPrices: ', fulfilledPrices)

    if (fulfilledPrices.length >= MINIMUM_SOURCES_PER_PRICE[pairType]) {
      const medianPrice = normalize(median(fulfilledPrices))
      if (isNaN(medianPrice)) {
        return Promise.reject(
          new Error(`${from}-${to} Only 2 sources. Price deviation too high.`)
        )
      }

      const priceInfo = {
        from: from,
        to: to,
        price: medianPrice,
        epoch: epochStart,
        certificates: certificates,
      }
      priceCache[cacheKey] = priceInfo
      return priceInfo
    } else {
      return Promise.reject(
        new Error(
          `${from}-${to} Insufficient data sources for a reliable price. ${fulfilledPrices.length}/${MINIMUM_SOURCES_PER_PRICE[pairType]}`
        )
      )
    }
  })
}

const fetchAllPrices = (pairs) => {
  return Promise.allSettled(
    pairs.map((pair) => {
      return fetchPrice(pair.from, pair.to).then((fetchedPriceInfo) => {
        // Clone the price info object, to not modify the cached object
        const priceInfo = { ...fetchedPriceInfo }
        console.log('' + pair.from + '-' + pair.to + ' price:', priceInfo.price)

        // Check that client price is within threshold
        if (pair.price) {
          const priceDeviation = percentDifference(pair.price, priceInfo.price)
          console.log('priceDeviation %: ' + priceDeviation)
          // If the client price is within the threshold, return it as valid price
          if (priceDeviation <= DEVIATION_THRESHOLD_PERCENT) {
            priceInfo.price = pair.price
          }
        }
        // If it is not within the threshold, return the fetched price

        return priceInfo
      })
    })
  ).then((results) => {
    const priceInfos = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)

    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.toString())

    return { priceInfos, errors }
  })
}

function hexToString(hexStr) {
  var result = ''
  for (var i = 0; i < hexStr.length; i += 2) {
    result += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16))
  }
  return result
}

function strToHex(str) {
  var hex = ''
  for (var i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

//this log sentry function works on SENTRY version processors
function logSentryProcessor(message) {
  if (_STD_ && _STD_.sentry && typeof _STD_.sentry.log === 'function') {
    _STD_.sentry.log(message)
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

//this log sentry function works on any processor that provides a SENTRY_KEY in the ENV variables
function logSentryPost(message) {
  if (_STD_ && _STD_.env['SENTRY_KEY']) {
    httpPOST(
      'https://sentry.papers.tech/api/207/store/',
      JSON.stringify({
        event_id: generateUUID(),
        timestamp: new Date().toISOString(),
        platform: 'javascript',
        message: {
          message: message,
        },
        tags: { tezosAddress: ownAddress() },
      }),
      {
        'Content-Type': 'application/json',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${_STD_.env['SENTRY_KEY']}, sentry_client=raven-bash/0.1`,
      },
      (rawResponse, certificate) => {},
      (errorMessage) => {}
    )
  }
}

function logSentry(message) {
  logSentryProcessor(message)
  logSentryPost(message)
}

logSentry('Script execution started')

async function main() {
  _STD_.ws.open(
    // open a websocket connection to the provided server
    WSS_URLS,
    () => {
      logSentry('<ws.open> : success')
      print('ws.open: success')

      _STD_.ws.registerPayloadHandler((payload) => {
        //parse incoming payload as JSON
        //expected format [{from: string, to: string, price: number}, {from: string, to: string, price: number}, ...]
        try {
          const startTimestamp = Date.now()

          const payloadJSON = JSON.parse(hexToString(payload.payload))
          console.log('payloadJSON', JSON.stringify(payloadJSON))
          const pairs = payloadJSON.map((pair) => {
            return {
              from: pair.from,
              to: pair.to,
              price: parseFloat(pair.price),
            }
          })

          logSentry(
            'payload received - price request : ' + JSON.stringify(payloadJSON)
          )

          fetchAllPrices(pairs)
            .then(({ priceInfos, errors }) => {
              // Destructure the returned object
              console.log('priceInfos', priceInfos)
              const signedPrices = priceInfos.map((info) => {
                const price = [
                  {
                    timestamp: info.epoch,
                    symbol: info.from + info.to,
                    price: info.price,
                  },
                ]

                const packedPrice = _STD_.chains.tezos.encoding.pack(price)
                const signature = _STD_.chains.tezos.signer.sign(packedPrice)

                return {
                  pair: info.from + info.to,
                  packedPrice,
                  signature,
                }
              })

              const endTimestamp = Date.now()
              const executionTime = endTimestamp - startTimestamp
              console.log('Price request took: ' + executionTime + 'ms')

              const responsePayload = {
                priceInfos,
                signedPrices: signedPrices,
                errors, // Include errors in the response payload
                timeInfos: {
                  startTimestamp,
                  endTimestamp,
                  executionTime: executionTime,
                },
                version: VERSION,
              }

              _STD_.ws.send(
                payload.sender,
                strToHex(JSON.stringify(responsePayload))
              )

              logSentry(
                'payload sent - price answer' +
                  JSON.stringify(payloadJSON) +
                  '- response payload : ' +
                  JSON.stringify(responsePayload)
              )
            })
            .catch((error) => {
              logSentry('<fetch prices> : ' + error.toString())
              console.log(error)
              _STD_.ws.send(
                payload.sender,
                strToHex(JSON.stringify({ error: error.message }))
              )
            })
        } catch (error) {
          logSentry(error.toString())
          print(error.message)
          _STD_.ws.send(
            payload.sender,
            strToHex(JSON.stringify({ error: error.message }))
          )
        }
      })
    },
    (err) => {
      logSentry('<WebSocket connection> : ' + err.toString())
      print('open: error ' + err)
    }
  )
}

main().catch((error) => {
  logSentry('<MAIN> ' + error.toString())
})
