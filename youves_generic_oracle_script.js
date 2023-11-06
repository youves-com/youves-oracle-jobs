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
const TWELVEDATA_API_TEMPLATE= `https://api.twelvedata.com/exchange_rate?symbol=<<FROM>>/<<TO>>&apikey=${environment('TWELVEDATA_API_KEY')}`
const ONE_FORGE_TEMPLATE = `https://api.1forge.com/convert?from=<<FROM>>&to=<<TO>>&quantity=1&api_key=${environment('ONE_FORGE_API_KEY')}` 
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
const KRAKEN_TEMPLATE = `https://api.kraken.com/0/public/OHLC?pair=<<FROM>><<TO>>&interval=15&since=${PREVIOUS_EPOCH_START_SECONDS}`

const BINANCE_CONFIG = { 'url': BINANCE_TEMPLATE, 'exchange_id': 'BNN', 'timestamp_factor': 1, 'timestamp_index': 0, 'close_index': 4, 'certificate': '427cda8bf433c2be42c7a12604208a826314f6ea0aa0064459807a6e7d4eb174' } 
const KUCOIN_CONFIG = { 'url': KUCOIN_TEMPLATE, 'exchange_id': 'KUC', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': 'c5ee9c223a618554983c7bc6a4f9eff0c73c5f56d706de2cb122a79dec5f37bc' } 
const GATE_IO_CONFIG = { 'url': GATE_IO_TEMPLATE, 'exchange_id': 'GAT', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': '077efad97c777defb43eedfc26ad42d8a15872af8b2fbd1ab151fd32310d48cd' } 

const BINANCE_US_CONFIG = {'url':BINANCE_US_TEMPLATE,'exchange_id':'BNU', 'timestamp_factor':1, 'timestamp_index':0, 'close_index':4, 'certificate': '1dfefb84d8fd578e3715ff3f602c1c4fdad67c80a61ad4a47f800295d5334988' } 
const COINBASE_CONFIG = {'url':COINBASE_TEMPLATE, 'exchange_id':'CBP', 'timestamp_factor':1000, 'timestamp_index':0, 'close_index':4, 'certificate': '4cf4dfa51e4dd8b8006dfa5f013e9d479b6485c000ee1526c8b3187856c74c5d'} 
const BITFINEX_CONFIG = {'url':BITFINEX_TEMPLATE, 'exchange_id':'BFX', 'timestamp_factor':1,'timestamp_index':0, 'close_index':2, 'certificate': '1c1d5438a493b0619f9bad45ec75e232555a69f201c28e2b74b737b76378365b' } 
const KRAKEN_CONFIG = { 'url': KRAKEN_TEMPLATE, 'exchange_id': 'KRK', 'timestamp_factor': 1000, 'timestamp_index': 0, 'close_index': 2, 'certificate': 'af871727cd625f7266f63058c3f395997ec5e6075e7a01a7c33e705a8be3fc38' }

const TWELVEDATA_API_CONFIG = {'url':TWELVEDATA_API_TEMPLATE, 'exchange_id':'12D', 'timestamp_factor':1000,'timestamp_index':2, 'close_index':1, 'certificate': '10a28b37065a6493a39f29d7f39634ec0e76ab54923665f0a286dd3006114718' }
const ONE_FORGE_CONFIG = {'url':ONE_FORGE_TEMPLATE, 'exchange_id':'1FR', 'timestamp_factor':1,'timestamp_index':2, 'close_index':0, 'certificate': '306b7629c64bba2d12b847e37bf491e1c0476e1979f9a2482ba978f04fb5bd65' }
const CURRENCY_API_CONFIG = {'url':CURRENCY_API_TEMPLATE, 'exchange_id':'CAP', 'timestamp_factor':1000,'timestamp_index':1, 'close_index':2, 'certificate': 'ebe6d0aeba472a3a614422c1ed3fc4e7c57d7919cd0077df122be3c98aa0006a' }

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
                { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36" },
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

                    if (config.exchange_id == "12D") {
                        response = [Object.values(response)]
                    } 

                    if (config.exchange_id == "CAP") {
                        response = [Object.values(response)]
                        response[0][2] = response[0][2]['result']
                    }

                    if (config.exchange_id == "KRK") {
                        response = Object.values(response['result'])[0]
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
    ...fetch(KRAKEN_CONFIG, FIAT_RAMP_PAIRS),
    ...fetch(TWELVEDATA_API_CONFIG, FOREX_PAIRS),
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