import { CoinHas, CoinHas2, WsResponseAllTickers } from 'fcoin-nodejs-api/src/types';

export interface FCoinConf {
  Key: string;
  Secret: string;
}

export interface SymbolMsg {
  exists_currency_property_config: boolean;
  full_name: string;
  logo_url: string;
  name: string;
  properties: {
    anticipation: string;
    circulation: string;
    circulation_market_value: string;
    circulation_rate: string;
    ecology_score: string;
    level: string;
    level_description: string;
    level_mobile_pdf_url: string;
    project_score: string;
    team_score: string;
    warning: string;
  }
}

export interface CoinHasInt {
  currency: string;
  category: string;
  available: number;
  frozen: number;
  balance: number;
  source: CoinHas;
}

export interface CoinHasInt2 extends CoinHasInt {
  demand_deposit: number; // 理财资产
  lock_deposit: number; // 锁仓资产
  source: CoinHas2;
}

export interface SymbolInfo {
  amount_decimal: number; // 深度精度
  base_currency: string; // Coin
  category: string; // FOne
  leveraged_multiple: null | string; // null | '5'
  limit_amount_max: string;
  limit_amount_min: string;
  main_tag: string;
  market_order_enabled: boolean;
  price_decimal: number; // 价格精度
  quote_currency: number; // 基准币
  symbol: string;
  tradeable: boolean; // 是否可交易
}

export interface FOneInfo {
  category: string; // "fone::mariana"
  category_code: string; // "mariana"
  category_name_cn: string; // "Mariana"
  category_name_en: string; // "Mariana"
  category_type: string; // "community_referrer"
  logo_url: string; // "https://www.fcoin.com/logos/f1df40cb41649de4bbc1c8f0519072d5.jpg"
}

export interface FCoinSymbols {
  categories: string[];
  category_ref: {
    [index: string]: string[];
  };
  symbols: {
    [index: string]: SymbolInfo;
  };
}

console.log(122);

export interface WsResponseAllTickersThis extends WsResponseAllTickers {
  coin: string;
  main: string;
  time: number;
}

export interface BidsAndAsks {
  vol: number;
  price: number;
  per: number;
  aper: number;
  avol: number;
}
