const INTERVAL = 900 * 1000

const MINIMUM_SOURCES_PER_PRICE = 2

const PREVIOUS_EPOCH_START_MILLIS = (Math.floor(Date.now() / INTERVAL) - 1) * INTERVAL
const PREVIOUS_EPOCH_END_MILLIS = ((Math.floor(Date.now() / INTERVAL)) * INTERVAL) - 1
const PREVIOUS_EPOCH_START_SECONDS = Math.floor(PREVIOUS_EPOCH_START_MILLIS / 1000)
const PREVIOUS_EPOCH_END_SECONDS = Math.floor(PREVIOUS_EPOCH_END_MILLIS / 1000)

const PREVIOUS_EPOCH_START_ISO = new Date(PREVIOUS_EPOCH_START_MILLIS).toISOString()
const PREVIOUS_EPOCH_END_ISO = new Date(PREVIOUS_EPOCH_END_MILLIS).toISOString()

// for index to USDT
const ALT_COIN_PAIRS = [['UNI','USDT'], ['CAKE', 'USDT'], ['AAVE','USDT']]

// for USDT<>USD
const FIAT_RAMP_PAIRS = [['BTC', 'USD'], ['XTZ', 'USD'], ['USDT', 'USD']]

const FOREX_PAIRS = [['XAU', 'USD'], ['CHF', 'USD'], ['EUR', 'USD']]

const PRICE_PRECISION = 10**6

// for CHF, EUR, XAU
const ONE_FORGE_TEMPLATE = `https://api.1forge.com/convert?from=<<FROM>>&to=<<TO>>&quantity=1&api_key=${environment('ONE_FORGE_API_KEY')}` 
const ALPHAVANTAGE_TEMPLATE = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=<<FROM>>&to_currency=<<TO>>&apikey=${environment('ALPHAVANTAGE_API_KEY')}`
const CURRENCY_API_TEMPLATE = `https://currencyapi.net/api/v1/convert?&from=<<FROM>>&to=<<TO>>&amount=1&output=JSON&key=${environment('CURRENCY_API_KEY')}`

// for XAU
// const ALPHAVANTAGE_TEMPLATE = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${environment('ALPHAVANTAGE_API_KEY')}`
// const METALS_LIVE_TEMPLATE = `https://api.metals.live/v1/spot/`
// const GOLDPRICE_ORG_TEMPLATE = `https://data-asg.goldprice.org/dbXRates/USD`
// const TRADING_ECONOMICS_TEMPLATE = `https://api.tradingeconomics.com/markets/intraday/<<SYMBOL>>:CUR?c=guest:guest&f=json&agr=15m&d1=${PREVIOUS_EPOCH_START_ISO}&d2=${PREVIOUS_EPOCH_END_ISO}`

const BINANCE_TEMPLATE = `https://api.binance.com/api/v3/klines?symbol=<<FROM>><<TO>>&interval=15m&startTime=${PREVIOUS_EPOCH_START_MILLIS}&endTime=${PREVIOUS_EPOCH_END_MILLIS}`
const KUCOIN_TEMPLATE = `https://api.kucoin.com/api/v1/market/candles?symbol=<<FROM>>-<<TO>>&type=15min&startAt=${PREVIOUS_EPOCH_START_SECONDS}&endAt=${PREVIOUS_EPOCH_END_SECONDS}`
const GATE_IO_TEMPLATE = `https://api.gateio.ws/api/v4/spot/candlesticks/?currency_pair=<<FROM>>_<<TO>>&interval=15m&from=${PREVIOUS_EPOCH_START_SECONDS}&to=${PREVIOUS_EPOCH_END_SECONDS}`

const BINANCE_US_TEMPLATE = `https://api.binance.us/api/v3/klines?symbol=<<FROM>><<TO>>&interval=15m&startTime=${PREVIOUS_EPOCH_START_MILLIS}&endTime=${PREVIOUS_EPOCH_END_MILLIS}`
const COINBASE_TEMPLATE = `https://api.pro.coinbase.com/products/<<FROM>>-<<TO>>/candles?granularity=900&start=${PREVIOUS_EPOCH_START_ISO}&end=${PREVIOUS_EPOCH_END_ISO}`
const BITFINEX_TEMPLATE = `https://api-pub.bitfinex.com/v2/candles/trade:15m:t<<FROM>><<TO>>/hist?start=${PREVIOUS_EPOCH_START_MILLIS}&end=${PREVIOUS_EPOCH_END_MILLIS}`

const BINANCE_CONFIG = { 'url': BINANCE_TEMPLATE, 'exchange_id': 'BNN', 'timestamp_factor': 1, 'timestamp_index': 0, 'close_index': 4, 'certificate': '7fb8a999a18ad88559cbceb886f5e029324ac3848a0b6b44dbd1747f4fd58feb' } 
const KUCOIN_CONFIG = { 'url': KUCOIN_TEMPLATE, 'exchange_id': 'KUC', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': 'd0e255e2dd1b6888a3d2eb2f844fb5f7a6cc70dbfbed25c0b8be5576985336a9' } 
const GATE_IO_CONFIG = { 'url': GATE_IO_TEMPLATE, 'exchange_id': 'GAT', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': '832a5b41bb287ba4c65c99a413245c535d15160751e23c696c9e749917866e83' } 

const BINANCE_US_CONFIG = {'url':BINANCE_US_TEMPLATE,'exchange_id':'BNU', 'timestamp_factor':1, 'timestamp_index':0, 'close_index':4, 'certificate': '0a4a5abd30c1258c20d950edf36b04ac2638ce8f0f60a1b56d39491de5706c20' } 
const COINBASE_CONFIG = {'url':COINBASE_TEMPLATE, 'exchange_id':'CBP', 'timestamp_factor':1000, 'timestamp_index':0, 'close_index':4, 'certificate': '8cad9a3d4efc90bfe95f5b1b25515c236f12095edfb76bc6ef8345ddea89f88b'} 
const BITFINEX_CONFIG = {'url':BITFINEX_TEMPLATE, 'exchange_id':'BFX', 'timestamp_factor':1,'timestamp_index':0, 'close_index':2, 'certificate': 'ca9bd1fe693926034b7d8850ed172c75886acbda28ff9c803872c0d411ea27c0' } 

const ALPHAVANTAGE_CONFIG = {'url':ALPHAVANTAGE_TEMPLATE, 'exchange_id':'ALV', 'timestamp_factor':1,'timestamp_index':5, 'close_index':4, 'certificate': '9795effec794cb26bebb29dd250e972e941a490989d029df1960a5144db6d850' }
const ONE_FORGE_CONFIG = {'url':ONE_FORGE_TEMPLATE, 'exchange_id':'1FR', 'timestamp_factor':1,'timestamp_index':2, 'close_index':0, 'certificate': '1c61847783ae60e64cb984a305139fe1b6c27792c0dfc632976405110e1813c7' }
const CURRENCY_API_CONFIG = {'url':CURRENCY_API_TEMPLATE, 'exchange_id':'CAP', 'timestamp_factor':1000,'timestamp_index':1, 'close_index':2, 'certificate': '3b09a02b3a136d0d6d9202a7a706ea22e79038313f7bf2b8769cc221bab2ac08' }

const fetch = (config, pairs) => {
    return pairs.map(pair => {
        return new Promise((resolve, reject) => {
            let url = ""
            if(config.exchange_id == "BFX" && pair[0] == "USDT"){
                url = config.url.replace("<<FROM>>", "UST").replace("<<TO>>", pair[1])
            } else {
                url = config.url.replace("<<FROM>>", pair[0]).replace("<<TO>>", pair[1])
            }

            httpGET(url,
                {},
                (rawResponse, certificate) => {
                    let response = JSON.parse(rawResponse)
                    if (config.exchange_id === "KUC") {
                        response = response['data']
                    }

                    if (config.exchange_id === "ALV") {
                        response = [Object.values(response["Realtime Currency Exchange Rate"])]
                        response[0][5] = new Date(Date(response[0][5]).toString()).getTime()
                    }

                    if (config.exchange_id == "MEL") {
                        response = [Object.values(response.map(x => Object.values(x)[0]))]
                    }
                    
                    if (config.exchange_id == "1FR") {
                        response = [Object.values(response)]
                    } 
                    
                    if (config.exchange_id == "CAP") {
                        response = [Object.values(response)]
                        response[0][2] = response[0][2]['result']
                    }

                    if(certificate === config.certificate){
                        const payload = {
                            'symbol': `${pair[0]+pair[1]}`,
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

const normalize = (value) => {
    return Math.round(median(value)*PRICE_PRECISION)
}

const promises = [
    ...fetch(BINANCE_CONFIG, ALT_COIN_PAIRS),
    ...fetch(KUCOIN_CONFIG, ALT_COIN_PAIRS),
    ...fetch(GATE_IO_CONFIG, ALT_COIN_PAIRS),
    ...fetch(BINANCE_US_CONFIG, FIAT_RAMP_PAIRS),
    ...fetch(COINBASE_CONFIG, FIAT_RAMP_PAIRS),
    ...fetch(BITFINEX_CONFIG, FIAT_RAMP_PAIRS),
    ...fetch(ALPHAVANTAGE_CONFIG, FOREX_PAIRS),
    ...fetch(ONE_FORGE_CONFIG, FOREX_PAIRS),
    ...fetch(CURRENCY_API_CONFIG, FOREX_PAIRS)
]

Promise.allSettled(promises).then((results) => {
    const fulfilledPayloads = results.filter((result) => result.status === "fulfilled").map((result) => result.value).filter((item) => item.timestamp >= PREVIOUS_EPOCH_START_MILLIS)
    print(JSON.stringify(fulfilledPayloads))
    const prices = fulfilledPayloads.reduce((previousValue, currentValue) => {
        if (currentValue.symbol in previousValue) {
            previousValue[currentValue.symbol].push(currentValue.close)
        } else {
            previousValue[currentValue.symbol] = [currentValue.close]
        }
        return previousValue
    }, {})

    const oraclePayload = {
        timestamp: PREVIOUS_EPOCH_END_SECONDS+1,
        prices: Object.entries(prices).filter((entry)=>entry[1].length >= MINIMUM_SOURCES_PER_PRICE).map((entry) => {return {symbol:entry[0], price:normalize(entry[1])}})
    }
    
    print(JSON.stringify(oraclePayload))
    
    fulfill(oraclePayload)
})
