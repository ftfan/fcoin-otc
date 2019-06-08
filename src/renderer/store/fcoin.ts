import Data from '../lib/data';
const HttpsProxyAgent = require('https-proxy-agent');
import { FCoinApi, FcoinWebSocket } from 'fcoin-nodejs-api';
import { CandleResolution, WsResponseCandle, SideEnum, WsResponseAllTickers, DepthLevel, WsResponseTicker, TickerData, DepthData } from 'fcoin-nodejs-api/src/types';
import { SymbolMsg, SymbolInfo, FOneInfo, FCoinSymbols, WsResponseAllTickersThis } from '../../types/FCoin';
import Vue from 'vue';
import { FCoinHttp, FCoinRequest } from '../lib/axios';
import { CodeObj, Code } from '../../../src/types/Code';

const RequestHandler: {
  [index: string]: Promise<any> | null;
} = {};
const BaseCoinSymbol = ['btcusdt', 'ethusdt', 'paxusdt', 'tusdusdt', 'usdcusdt', 'gusdusdt'];

function FCoinCreate (agent?: any) {
  const val = new FCoinApi('', '', agent ? new HttpsProxyAgent(agent) : undefined, 'fcoin.pro');
  return val;
}
class Store extends Data {
  state = {
    FCoin: FCoinCreate(),
    WsInitTime: 0, // 记录初始化ws的时候时间。
    FCoinWs: {} as FcoinWebSocket,
    Candles: [] as WsResponseCandle[], // 蜡烛图

    AllAnsData: {
      // usdt: {
      //   symbol: 'usdt',
      //   coin: 'usdt',
      //   main: 'usdt',
      //   time: Date.now(),
      //   ticker: {
      //     LastPrice: 1, // 最新成交价
      //     LastVolume: 1, // 最近一笔成交量
      //     MaxBuyPrice: 1, // 最大买一价格
      //     MaxBuyVolume: 1, // 最大买一量
      //     MinSalePrice: 1, // 最小卖一价格
      //     MinSaleVolume: 1, // 最小卖一量
      //     BeforeH24Price: 1, // 24小时前成交价
      //     HighestH24Price: 1, // 24小时内最高价
      //     LowestH24Price: 1, // 24小时内最低价
      //     OneDayVolume1: 1, // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
      //     OneDayVolume2: 1, // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
      //   },
      // },
    } as {
      [index: string]: WsResponseAllTickersThis;
    },

    SymbolLastInfo: {
      usdt: {
        // usdt: {
        //   symbol: 'usdt',
        //   ticker: {
        //     LastPrice: 1, // 最新成交价
        //     LastVolume: 1, // 最近一笔成交量
        //     MaxBuyPrice: 1, // 最大买一价格
        //     MaxBuyVolume: 1, // 最大买一量
        //     MinSalePrice: 1, // 最小卖一价格
        //     MinSaleVolume: 1, // 最小卖一量
        //     BeforeH24Price: 1, // 24小时前成交价
        //     HighestH24Price: 1, // 24小时内最高价
        //     LowestH24Price: 1, // 24小时内最低价
        //     OneDayVolume1: 1, // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
        //     OneDayVolume2: 1, // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
        //   },
        // },
      },
    } as {
      [index: string]: { [index: string]: WsResponseAllTickersThis };
    },
  };
  // 刷新后依旧留存的状态
  readonly localState = {
    Proxy: {
      Http: { host: '', port: '', secureProxy: true },
    },

    Usdt: 0,

    Symbols: {} as { [index: string]: SymbolInfo; },
    AllRefs: {} as {
      [index: string]: { [index: string]: string[]; };
    },
    Ref: {} as { [index: string]: string[]; },
    SymbolMsg: {} as { [index: string]: SymbolMsg },
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `fcoin:data`;

  constructor () {
    super();
    this.initilization();
    this.Reload();
  }

  async FTokenFetch () {
    if (RequestHandler.FTokenFetch) return RequestHandler.FTokenFetch;
    RequestHandler.FTokenFetch = FCoinHttp.get('/openapi/v1/exchange/trading_fees_group').then(FCoinRequest).then(res => {
      RequestHandler.FTokenFetch = null;
      if (res.Error()) return res;
      return new CodeObj(Code.Success, res.Data);
    });
    return RequestHandler.FTokenFetch;
  }

  async FinancialDividends () {
    if (RequestHandler.FinancialDividends) return RequestHandler.FinancialDividends;
    RequestHandler.FinancialDividends = FCoinHttp.get('/openapi/v1/financial_dividends').then(FCoinRequest).then(res => {
      RequestHandler.FinancialDividends = null;
      if (res.Error()) return res;
      return new CodeObj(Code.Success, res.Data);
    });
    return RequestHandler.FinancialDividends;
  }

  async FetchUsdt () {
    if (RequestHandler.FetchUsdt) return RequestHandler.FetchUsdt;
    RequestHandler.FetchUsdt = FCoinHttp.get('/openapi/v1/exchange_rate/convert').then(FCoinRequest).then(res => {
      RequestHandler.FetchUsdt = null;
      if (res.Error()) return res;
      this.localState.Usdt = parseFloat(res.Data as string);
    });
    return RequestHandler.FetchUsdt;
  }

  async FetchSymbolDepth (symbol: string): Promise<CodeObj<DepthData>> {
    if (RequestHandler[`FetchSymbolDepth--${symbol}`]) return RequestHandler[`FetchSymbolDepth--${symbol}`];
    RequestHandler[`FetchSymbolDepth--${symbol}`] = this.state.FCoin.Depth(symbol, 'L150' as any).then(res => {
      RequestHandler[`FetchSymbolDepth--${symbol}`] = null;
      if (res.status) return new CodeObj(Code.Error, null, res.msg);
      return new CodeObj(Code.Success, res.data);
    });
    return RequestHandler[`FetchSymbolDepth--${symbol}`];
  }

  async FetchSymbolLastInfo (symbol: string):Promise<CodeObj<TickerData>> {
    if (RequestHandler[`FetchSymbolLastInfo--${symbol}`]) return RequestHandler[`FetchSymbolLastInfo--${symbol}`];
    RequestHandler[`FetchSymbolLastInfo--${symbol}`] = this.state.FCoin.Ticker(symbol).then(res => {
      RequestHandler[`FetchSymbolLastInfo--${symbol}`] = null;
      if (res.status) return new CodeObj(Code.Error, null, res.msg);
      return new CodeObj(Code.Success, res.data);
    });
    return RequestHandler[`FetchSymbolLastInfo--${symbol}`];
  }

  async FeatchSymbols () {
    const [res, cate] = await Promise.all([
      FCoinHttp.get('/openapi/v2/symbols').then(FCoinRequest),
      FCoinHttp.get('/openapi/v1/categories').then(FCoinRequest),
    ]);
    if (res.Error()) return res;
    if (cate.Error()) return cate;
    this.FetchUsdt();
    const resData = res.Data as FCoinSymbols;

    this.localState.Symbols = resData.symbols;
    // 给每个FOne 设置交易对
    // for (const fone in resData.category_ref) {
    //   const data = resData.category_ref[fone];
    //   const sys: { [index: string]: string[]; } = {};
    //   data.forEach(str => {
    //     const temp = this.localState.Symbols[str];
    //     if (!temp) return console.log(str); // 找不到对应的数据
    //     sys[temp.quote_currency] = sys[temp.quote_currency] || [];
    //     sys[temp.quote_currency].push(temp.base_currency);
    //   });
    //   this.localState.AllRefs[fone] = sys;
    // }
    console.log(res, cate);
    return new CodeObj(Code.Success);
  }

  async FeatchSymbolDes () {
    const res = await FCoinHttp.get('/openapi/v1/currency_properties').then(FCoinRequest);
    if (res.Error()) return res;
    const data = res.Data as SymbolMsg[];
    data.forEach(sym => {
      this.localState.SymbolMsg[sym.name] = sym;
    });
    return new CodeObj(Code.Success);
  }

  async Reload () {
    this.state.FCoin = FCoinCreate(this.localState.Proxy.Http.host ? this.localState.Proxy.Http : undefined);
    await this.FeatchSymbols();
    if (this.state.FCoinWs.Close) this.state.FCoinWs.Close();
    this.state.FCoinWs = new FcoinWebSocket({
      agent: this.localState.Proxy.Http.host ? new HttpsProxyAgent(this.localState.Proxy.Http) : undefined,
    }, 'fcoin.pro');
    this.state.FCoinWs.HeartbeatInit(5000); // 5秒呼吸
    this.state.WsInitTime = this.state.FCoinWs.LastHeartbeat.ts;
    this.state.Candles = [];
    this.state.FCoinWs.Heartbeat();
    const All = this.localState.Symbols;

    const Hnadler = (symbol: string, item: WsResponseTicker) => {
      if (!item) return console.info('空');
      const info = All[symbol];
      if (!info) return console.info('未找到', item);
      if (!info.tradeable) return;
      if (!(this.state.SymbolLastInfo as any)[info.quote_currency]) {
        Vue.set((this.state.SymbolLastInfo as any), info.quote_currency, {});
      }
      Vue.set(this.state.SymbolLastInfo[info.quote_currency], info.base_currency, Object.assign(item, {
        coin: info.base_currency,
        main: info.quote_currency,
        time: Date.now(),
      }));
      try {
        const has = this.state.AllAnsData[info.base_currency];
        if (has && has.main === 'usdt') return;
        const pow = MainCoinPow[info.quote_currency as any];
        const haspow = has ? MainCoinPow[has.main] : 0;
        if (haspow > pow) return;
        this.state.AllAnsData[info.base_currency] = this.state.SymbolLastInfo[info.quote_currency][info.base_currency];
      } catch (e) {
        console.error(e);
      }
    };
    BaseCoinSymbol.forEach(symbol => {
      this.state.FCoinWs.OnTicker(symbol, (data) => {
        Hnadler(symbol, data);
      });
    });
    this.state.FCoinWs.OnAllTickers(data => {
      data.forEach(item => Hnadler(item.symbol, { ticker: item.ticker } as WsResponseTicker));
    });
  }
}

const MainCoinPow: {[ index: string]: number; } = {
  usdt: 100,
  btc: 90,
  eth: 80,
  ft: 70,
  pax: 60,
  tusd: 50,
  usdc: 40,
};

export const FCoinStore = new Store();
