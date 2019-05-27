import Data from '../lib/data';
import { FcoinWebSocket } from 'fcoin-nodejs-api';
import { CandleResolution, WsResponseCandle, SideEnum, WsResponseAllTickers } from 'fcoin-nodejs-api/src/types';
import { CodeObj, Code } from '../../types/Code';
import Vue from 'vue';
import { FOneInfo } from 'src/types/FCoin';
import { UserStore } from './user';
const HttpsProxyAgent = require('https-proxy-agent');

class Store extends Data {
  state = {
    WsInitTime: 0, // 记录初始化ws的时候时间。
    FCoinWs: {} as FcoinWebSocket,
    Candles: [] as WsResponseCandle[], // 蜡烛图
    LastTrade: {
      amount: 0,
      ts: Date.now(),
      id: 0,
      side: SideEnum.Buy,
      price: 0,
    }, // 最后一笔成交价
    Runing: [] as number[], // 跑步者
    TestRuning: [] as number[], // 跑步者
  };

  // 刷新后依旧留存的状态
  readonly localState = {
    SymbolLastInfo: {
      usdt: {
        usdt: {
          symbol: 'usdt',
          ticker: {
            LastPrice: 1, // 最新成交价
            LastVolume: 1, // 最近一笔成交量
            MaxBuyPrice: 1, // 最大买一价格
            MaxBuyVolume: 1, // 最大买一量
            MinSalePrice: 1, // 最小卖一价格
            MinSaleVolume: 1, // 最小卖一量
            BeforeH24Price: 1, // 24小时前成交价
            HighestH24Price: 1, // 24小时内最高价
            LowestH24Price: 1, // 24小时内最低价
            OneDayVolume1: 1, // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
            OneDayVolume2: 1, // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
          },
        },
      },
      btc: {},
      eth: {},
      ft: {},
    } as {
      [index: string]: { [index: string]: WsResponseAllTickers; };
    },
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `runner`;

  constructor () {
    super();
    this.initilization();
    this.InitWs();
  }

  InitWs () {
    console.log('InitWs');
    if (this.state.FCoinWs.Close) this.state.FCoinWs.Close();
    this.state.FCoinWs = new FcoinWebSocket({
      agent: UserStore.localState.Proxy.Http.host ? new HttpsProxyAgent(UserStore.localState.Proxy.Http) : undefined,
    });
    this.state.FCoinWs.HeartbeatInit(5000); // 5秒呼吸
    this.state.WsInitTime = this.state.FCoinWs.LastHeartbeat.ts;
    this.state.Candles = [];
    this.state.FCoinWs.Heartbeat();
    // const symbolName = HiveStore.localState.Symbols.join('');

    // 监听蜡烛
    // this.state.FCoinWs.OnCandle(symbolName, CandleResolution.M1, (data) => {
    //   this.state.Candles.push(data);
    //   if (this.state.Candles.length > 1000) {
    //     this.state.Candles.splice(0, this.state.Candles.length - 1000);
    //   }
    //   console.log('Candles', data);
    // });

    // 监听所有币的价格变动
    this.state.FCoinWs.OnAllTickers((data) => {
      // console.log(data);
      data.map(item => {
        if (item.symbol.match(/usdt$/)) return { main: 'usdt', coin: item.symbol.replace(/usdt$/, ''), item };
        if (item.symbol.match(/btc$/)) return { main: 'btc', coin: item.symbol.replace(/btc$/, ''), item };
        if (item.symbol.match(/eth$/)) return { main: 'eth', coin: item.symbol.replace(/eth$/, ''), item };
        if (item.symbol.match(/ft$/)) return { main: 'ft', coin: item.symbol.replace(/ft$/, ''), item };
        if (item.symbol.match(/pax$/)) return { main: 'pax', coin: item.symbol.replace(/pax$/, ''), item };
        if (item.symbol.match(/tusd$/)) return { main: 'tusd', coin: item.symbol.replace(/tusd$/, ''), item };
        if (item.symbol.match(/usdc$/)) return { main: 'usdc', coin: item.symbol.replace(/usdc$/, ''), item };
        return null;
      }).forEach(item => {
        if (!item) return;
        // if (`${item.main}.${item.coin}` === 'usdt.ft') console.log(`${item.main}.${item.coin}`, item.item.ticker);
        Vue.set((this.localState.SymbolLastInfo as any)[item.main], item.coin, item.item);
        // OrderStore.UnitPriceChange(`${item.coin}${item.main}`, item.item.ticker);
      });
    });

    // 监听交易信息
    // this.state.FCoinWs.OnTrade(symbolName, '20', (data) => {
    //   console.log('OnTrade', data);
    //   this.state.LastTrade = data;
    // });
  }
}

export const RunnerStore = new Store();
