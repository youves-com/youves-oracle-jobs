const INTERVAL = 900 * 1000

const MINIMUM_SOURCES_PER_PRICE = 2

const PREVIOUS_EPOCH_START_MILLIS = (Math.floor(Date.now() / INTERVAL) - 1) * INTERVAL
const PREVIOUS_EPOCH_END_MILLIS = ((Math.floor(Date.now() / INTERVAL)) * INTERVAL) - 1
const PREVIOUS_EPOCH_START_SECONDS = Math.floor(PREVIOUS_EPOCH_START_MILLIS / 1000)
const PREVIOUS_EPOCH_END_SECONDS = Math.floor(PREVIOUS_EPOCH_END_MILLIS / 1000)

const PREVIOUS_EPOCH_START_ISO = new Date(PREVIOUS_EPOCH_START_MILLIS).toISOString()
const PREVIOUS_EPOCH_END_ISO = new Date(PREVIOUS_EPOCH_END_MILLIS).toISOString()

// for index to USDT
const BINANCE_SYMBOLS = ['UNIUSDT', 'CAKEUSDT', 'LUNAUSDT', 'LINKUSDT', 'AAVEUSDT']
const KUCOIN_SYMBOLS = ['UNI-USDT', 'CAKE-USDT', 'LUNA-USDT', 'LINK-USDT', 'AAVE-USDT']
const GATEIO_SYMBOLS = ['UNI_USDT', 'CAKE_USDT', 'LUNA_USDT', 'LINK_USDT', 'AAVE_USDT']

// for USDT<>USD
const COINBASE_SYMBOLS = ['BTC-USD','XTZ-USD','USDT-USD']
const BITFINEX_SYMBOLS = ['BTCUSD','XTZUSD','USTUSD']
const BINANCE_US_SYMBOLS = ['BTCUSD','XTZUSD','USDTUSD']

const PRICE_PRECISION = 10**6

// for index to USDT
const BINANCE_TEMPLATE = `https://api.binance.com/api/v3/klines?symbol=<<SYMBOL>>&interval=15m&startTime=${PREVIOUS_EPOCH_START_MILLIS}&endTime=${PREVIOUS_EPOCH_END_MILLIS}`
const KUCOIN_TEMPLATE = `https://api.kucoin.com/api/v1/market/candles?symbol=<<SYMBOL>>&type=15min&startAt=${PREVIOUS_EPOCH_START_SECONDS}&endAt=${PREVIOUS_EPOCH_END_SECONDS}`
const GATE_IO_TEMPLATE = `https://api.gateio.ws/api/v4/spot/candlesticks/?currency_pair=<<SYMBOL>>&interval=15m&from=${PREVIOUS_EPOCH_START_SECONDS}&to=${PREVIOUS_EPOCH_END_SECONDS}`

// for USDT<>USD
const BINANCE_US_TEMPLATE = `https://api.binance.us/api/v3/klines?symbol=<<SYMBOL>>&interval=15m&startTime=${PREVIOUS_EPOCH_START_MILLIS}&endTime=${PREVIOUS_EPOCH_END_MILLIS}`
const COINBASE_TEMPLATE = `https://api.pro.coinbase.com/products/<<SYMBOL>>/candles?granularity=900&start=${PREVIOUS_EPOCH_START_ISO}&end=${PREVIOUS_EPOCH_END_ISO}`
const BITFINEX_TEMPLATE = `https://api-pub.bitfinex.com/v2/candles/trade:15m:t<<SYMBOL>>/hist?start=${PREVIOUS_EPOCH_START_MILLIS}&end=${PREVIOUS_EPOCH_END_MILLIS}`

const BINANCE_CONFIG = { 'url': BINANCE_TEMPLATE, 'exchange_id': 'BNN', 'timestamp_factor': 1, 'timestamp_index': 0, 'close_index': 4, 'certificate': '7fb8a999a18ad88559cbceb886f5e029324ac3848a0b6b44dbd1747f4fd58feb' }
const KUCOIN_CONFIG = { 'url': KUCOIN_TEMPLATE, 'exchange_id': 'KUC', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': 'd0e255e2dd1b6888a3d2eb2f844fb5f7a6cc70dbfbed25c0b8be5576985336a9' }
const GATE_IO_CONFIG = { 'url': GATE_IO_TEMPLATE, 'exchange_id': 'GAT', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': '832a5b41bb287ba4c65c99a413245c535d15160751e23c696c9e749917866e83' }

const BINANCE_US_CONFIG = {'url':BINANCE_US_TEMPLATE,'exchange_id':'BNU', 'timestamp_factor':1, 'timestamp_index':0, 'close_index':4, 'certificate': 'b68fb71edd6b691a42a5d79b1bc4df225782229112ed52f1ba3c1ded258c8e31' }
const COINBASE_CONFIG = {'url':COINBASE_TEMPLATE, 'exchange_id':'CBP', 'timestamp_factor':1000, 'timestamp_index':0, 'close_index':4, 'certificate': 'd6487de59f4bbf86bc432f81904fecff028350e8f5bf08eb1fe617b7a161c5ca'}
const BITFINEX_CONFIG = {'url':BITFINEX_TEMPLATE, 'exchange_id':'BFX', 'timestamp_factor':1,'timestamp_index':0, 'close_index':2, 'certificate': 'ab7283ac13db585fe1e4ea00fdc132bbbfa0138ada9dfe17867d8dc6cf5e70ef' }

const INITIAL_PRICES = {
    'AAVEUSD': 150.80,
    'CAKEUSD': 6.52,
    'LINKUSD': 14.76,
    'LUNAUSD': 94.46,
    'UNIUSD': 9.36
}

const WEIGHTS = {
    'AAVE': 0.0406,
    'CAKE': 0.0368,    
    'LINK': 0.1335,
    'LUNA': 0.6654,
    'UNI': 0.1238,    
}

const LAST_REBALANCING_PRICE = 1.21617108

const fetch = (config, symbols) => {
    return symbols.map(symbol => {
        return new Promise((resolve, reject) => {
            httpGET(config.url.replace("<<SYMBOL>>", symbol),
                {},
                (rawResponse, certificate) => {
                    let response = JSON.parse(rawResponse)
                    if (config.exchange_id === "KUC") {
                        response = response['data']
                    }

                    if(certificate === config.certificate){
                        const payload = {
                            'symbol': symbol.replace("-", "").replace("_", "").replace("UST", "USDT"),
                            'exchange_id': config.exchange_id,
                            'timestamp': response[0][config.timestamp_index] * config.timestamp_factor,
                            'close': parseFloat(response[0][config.close_index]),
                            'certificate': certificate
                        }
                        resolve(payload)
                    } else {
                        reject("certificate does not match")
                    }                    
                },
                (errorMessage) => {
                    reject(errorMessage)
                }
            )
        })
    })
}

const median = (values) => {
    values.sort((a,b) => a-b)

    if (values.length%2 == 0){
        return (values[Math.floor(values.length / 2)]+values[Math.floor(values.length / 2)-1])/2.0
    } else { 
        return values[Math.floor(values.length / 2)]
    }
}

const promises = [
    ...fetch(BINANCE_CONFIG, BINANCE_SYMBOLS),
    ...fetch(KUCOIN_CONFIG, KUCOIN_SYMBOLS),
    ...fetch(GATE_IO_CONFIG, GATEIO_SYMBOLS),

    ...fetch(BINANCE_US_CONFIG, BINANCE_US_SYMBOLS),
    ...fetch(COINBASE_CONFIG, COINBASE_SYMBOLS),
    ...fetch(BITFINEX_CONFIG, BITFINEX_SYMBOLS)
]

Promise.allSettled(promises).then((results) => {
    const fulfilledPayloads = results.filter((result) => result.status === "fulfilled").map((result) => result.value).filter((item) => item.timestamp === PREVIOUS_EPOCH_START_MILLIS)
    
    const prices = fulfilledPayloads.reduce((previousValue, currentValue) => {
        if (currentValue.symbol in previousValue) {
            previousValue[currentValue.symbol].push(currentValue.close)
        } else {
            previousValue[currentValue.symbol] = [currentValue.close]
        }
        return previousValue
    }, {})

    
    const indexPrice = LAST_REBALANCING_PRICE * PRICE_PRECISION * (
        WEIGHTS['UNI'] * (median(prices['UNIUSDT']) / INITIAL_PRICES['UNIUSD']) +
        WEIGHTS['LINK'] * (median(prices['LINKUSDT']) / INITIAL_PRICES['LINKUSD']) +
        WEIGHTS['LUNA'] * (median(prices['LUNAUSDT']) / INITIAL_PRICES['LUNAUSD']) +
        WEIGHTS['CAKE'] * (median(prices['CAKEUSDT']) / INITIAL_PRICES['CAKEUSD']) +
        WEIGHTS['AAVE'] * (median(prices['AAVEUSDT']) / INITIAL_PRICES['AAVEUSD'])
    ) / median(prices['USDTUSD'])
    
    const sources_count = Math.min(...Object.values(prices).map((values) => values.length))

    if(sources_count >= MINIMUM_SOURCES_PER_PRICE){
        const oraclePayload = {
            timestamp: PREVIOUS_EPOCH_START_SECONDS,
            defi_price: Math.round(indexPrice),
            xtz_price: Math.round(median(prices['XTZUSD'])*PRICE_PRECISION),
            btc_price: Math.round(median(prices['BTCUSD'])*PRICE_PRECISION),
        }
        fulfill(oraclePayload)
    }
})
