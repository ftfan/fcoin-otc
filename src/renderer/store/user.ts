import Data from '../lib/data';
import { FCoinApi } from 'fcoin-nodejs-api';
import { CodeObj, Code } from '../../../src/types/Code';
import { SideEnum, OrderState, OrderResult, CandleResolution, LeveragedBalance } from 'fcoin-nodejs-api/src/types';
import { EncryptStrByPassword, DecryptStrByPassword } from '../lib/aes';
import { Md5 } from "md5-typescript";
import Vue from 'vue';
import { CoinHasInt, CoinHasInt2 } from '../../../src/types/FCoin';
import { clone } from '../lib/utils';
const PasswordCheckString = 'hive-capital';
const dateformat = require('dateformat-util');
const HttpsProxyAgent = require('https-proxy-agent');

function FCoinCreate (key: string, secret: string, agent?: any) {
  const val = new FCoinApi(key, secret, agent ? new HttpsProxyAgent(agent) : undefined);
  // val.axios.interceptors.request.use(req => {
  //   req.headers = req.headers || {};
  //   // req.headers['Access-Control-Allow-Origin'] = '*';
  //   return req;
  // });

  return val;
}

interface MarginCoin {
  Source: LeveragedBalance;
  leveraged_account_type: string;              // 杠杆账户类型
  base: string;                                    // 基准币种
  quote: string;                                  // 计价币种
  available_base_currency_amount: number;      // 可用的基准币种资产
  frozen_base_currency_amount: number;               // 冻结的基准币种资产
  available_quote_currency_amount: number;      // 可用的计价币种资产
  frozen_quote_currency_amount: number;              // 冻结的计价币种资产
  available_base_currency_loan_amount: number;   // 可借的基准币种数量
  available_quote_currency_loan_amount: number; // 可借的计价币种数量
  blow_up_price: number;                            // 爆仓价
  risk_rate: number;                              // 爆仓风险率
}

class Store extends Data {
  state = {
    FCoin: FCoinCreate('', ''),
    Coins: [] as CoinHasInt[],
    Coins2: [] as CoinHasInt2[],
    MarginCoins: {} as { [index: string]: MarginCoin; },
  };

  sessionState = {
    Login: false,
    FcoinConf: {
      Key: '',
      Secret: '',
    },
  };

  // 刷新后依旧留存的状态
  localState = {
    DevData: { IsAdmin: false },
    Proxy: {
      Http: { host: '', port: '', secureProxy: true },
    },
    FcoinConfs: [] as { Key: string; Secret: string; Name: string; }[],
    FcoinConf: {
      Key: '',
      Secret: '',
    },
    Password: '',
    rt: '',
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `user`;

  constructor () {
    super();
    this.initilization();
    // this.localState.Proxy = '' as any;
    if (!this.localState.Proxy) {
      this.localState.Proxy = {
        Http: { host: '', port: '', secureProxy: true },
      };
    }
    this.state.FCoin = FCoinCreate(this.sessionState.FcoinConf.Key, this.sessionState.FcoinConf.Secret, this.localState.Proxy.Http.host ? this.localState.Proxy.Http : undefined);
  }

  CreatePwdMd5 (s: string) {
    const a = Md5.init(s);
    const b = Md5.init(a + a + s);
    const c = Md5.init(a + b + s);
    const d = Md5.init(b + c + s);
    const e = Md5.init(a + b + c + d + s);
    return Md5.init(e);
  }

  // 设置API信息
  async SetApiInfo (Key: string, Secret: string, Password = '') {
    const res = await this.CheckKeySecret(Key, Secret);
    if (res.Error()) return res;

    // 密码校验
    const pwd = EncryptStrByPassword(Password, PasswordCheckString);
    if (pwd.Error()) return pwd;
    this.localState.Password = pwd.Data;

    const key = EncryptStrByPassword(Password, Key);
    if (key.Error()) return key;
    this.localState.FcoinConf.Key = key.Data;
    // this.sessionState.FcoinConf.Key = key.Data;

    const sec = EncryptStrByPassword(Password, Secret);
    if (sec.Error()) return sec;
    this.localState.FcoinConf.Secret = sec.Data;
    // this.sessionState.FcoinConf.Secret = sec.Data;
    this.localState.FcoinConfs.splice(0, this.localState.FcoinConfs.length); // 清空
    this.PushUserKey(this.localState.FcoinConf.Key, this.localState.FcoinConf.Secret);
    return res;
  }

  PushUserKey (Key: string, Secret: string, Name = '第一个') {
    this.localState.FcoinConfs.push({ Key, Secret, Name });
  }

  async AddUserKey (Key: string, Secret: string, Name: string, Password = '') {
    const res = await this.CheckKeySecret(Key, Secret);
    if (res.Error()) return res;

    // 密码校验
    const pwd = EncryptStrByPassword(Password, PasswordCheckString);
    if (pwd.Error()) return pwd;
    this.localState.Password = pwd.Data;

    const key = EncryptStrByPassword(Password, Key);
    if (key.Error()) return key;
    const sec = EncryptStrByPassword(Password, Secret);
    if (sec.Error()) return sec;
    this.PushUserKey(key.Data, sec.Data, Name);
    return sec;
  }

  UseKey (Keyy: string, Secrett: string, Password = '') {
    const res = DecryptStrByPassword(Password, this.localState.Password);
    if (res.Error()) return new CodeObj(Code.PasswordError, null, '密码错误');
    if (res.Data !== PasswordCheckString) return new CodeObj(Code.PasswordError, null, '密码错误');

    const Key = DecryptStrByPassword(Password, Keyy);
    const Secret = DecryptStrByPassword(Password, Secrett);
    if (Key.Error()) return Key;
    if (Secret.Error()) return Secret;
    this.localState.FcoinConf.Key = Keyy;
    this.localState.FcoinConf.Secret = Secrett;
    this.sessionState.FcoinConf.Key = Key.Data;
    this.sessionState.FcoinConf.Secret = Secret.Data;
    return this.CheckKeySecret(this.sessionState.FcoinConf.Key, this.sessionState.FcoinConf.Secret);
  }

  CheckPd (us = '') {
    return new CodeObj(Code.Success);
  }

  CheckHiveKey (key: string, us: string) {
    return us.toLocaleLowerCase() === Md5.init('OTC:' + key).toLocaleLowerCase();
  }

  async Login (Password = '') {
    const res = DecryptStrByPassword(Password, this.localState.Password);
    if (res.Error()) return new CodeObj(Code.PasswordError, null, '密码错误');
    if (res.Data !== PasswordCheckString) return new CodeObj(Code.PasswordError, null, '密码错误');

    const Key = DecryptStrByPassword(Password, this.localState.FcoinConf.Key);
    const Secret = DecryptStrByPassword(Password, this.localState.FcoinConf.Secret);
    if (Key.Error()) return Key;
    if (Secret.Error()) return Secret;
    this.sessionState.FcoinConf.Key = Key.Data;
    this.sessionState.FcoinConf.Secret = Secret.Data;
    return this.CheckKeySecret(this.sessionState.FcoinConf.Key, this.sessionState.FcoinConf.Secret);
  }

  LoginOut () {
    this.sessionState.Login = false;
    this.sessionState.FcoinConf.Key = '';
    this.sessionState.FcoinConf.Secret = '';
    this.state.FCoin = FCoinCreate(this.sessionState.FcoinConf.Key, this.sessionState.FcoinConf.Secret, this.localState.Proxy.Http.host ? this.localState.Proxy.Http : undefined);
  }

  async CheckKeySecret (Key: string, Secret: string) {
    this.state.FCoin = FCoinCreate(Key, Secret, this.localState.Proxy.Http.host ? this.localState.Proxy.Http : undefined);
    const res = await this.FeatchCoins();
    if (res.Error()) return res;
    this.sessionState.Login = true;
    return new CodeObj(Code.Success);
  }

  async FeatchCoins () {
    const res = await this.state.FCoin.FetchBalance();
    if (res.status) return new CodeObj(res.status, null, res.msg);
    this.state.Coins = res.data.filter(coin => {
      if (parseFloat(coin.balance) === 0) return false;
      return true;
    }).map(coin => {
      return {
        currency: coin.currency,
        category: coin.category,
        balance: parseFloat(coin.balance),
        frozen: parseFloat(coin.frozen),
        available: parseFloat(coin.available),
        source: coin,
      };
    });
    return new CodeObj(Code.Success, res.data);
  }

  async FeatchCoins2 () {
    const res = await this.state.FCoin.FetchBalance2();
    if (res.status) return new CodeObj(res.status, null, res.msg);
    this.state.Coins2 = res.data.filter(coin => {
      if (parseFloat(coin.balance) === 0) return false;
      return true;
    }).map(coin => {
      return {
        currency: coin.currency,
        category: coin.category,
        balance: parseFloat(coin.balance),
        frozen: parseFloat(coin.frozen),
        available: parseFloat(coin.available),
        demand_deposit: parseFloat(coin.demand_deposit),
        lock_deposit: parseFloat(coin.lock_deposit),
        source: coin,
      };
    });
    return new CodeObj(Code.Success, res.data);
  }

  async Spot2Assets (currency: string, amount: number) {
    return this.state.FCoin.Spot2Assets(currency, amount);
  }
  async Assets2Spot (currency: string, amount: number) {
    return this.state.FCoin.Assets2Spot(currency, amount);
  }

  async FeatchMarginCoins () {
    const res = await this.state.FCoin.FetchLeveragedBalances();
    if (res.status) return new CodeObj(res.status, null, res.msg);
    res.data.forEach(coin => {
      Vue.set(this.state.MarginCoins, `${coin.base}${coin.quote}`, {
        Source: coin,
        leveraged_account_type: coin.leveraged_account_type,              // 杠杆账户类型
        base: coin.base,                                    // 基准币种
        quote: coin.quote,                                  // 计价币种
        available_base_currency_amount: parseFloat(coin.available_base_currency_amount),      // 可用的基准币种资产
        frozen_base_currency_amount: parseFloat(coin.frozen_base_currency_amount),               // 冻结的基准币种资产
        available_quote_currency_amount: parseFloat(coin.available_quote_currency_amount),      // 可用的计价币种资产
        frozen_quote_currency_amount: parseFloat(coin.frozen_quote_currency_amount),              // 冻结的计价币种资产
        available_base_currency_loan_amount: parseFloat(coin.available_base_currency_loan_amount),   // 可借的基准币种数量
        available_quote_currency_loan_amount: parseFloat(coin.available_quote_currency_loan_amount), // 可借的计价币种数量
        blow_up_price: parseFloat(coin.blow_up_price),                            // 爆仓价
        risk_rate: parseFloat(coin.risk_rate),                              // 爆仓风险率
      });
    });
    return new CodeObj(Code.Success, res.data);
  }

  async FeatchUserOrderState (symbol: string, states: OrderState[], limit: number, after: number, before: number) {
    let time = undefined;
    if (after) time = { value: after, type: 'after' };
    if (before) time = { value: before, type: 'before' };
    const res = await this.state.FCoin.FetchOrders(symbol, states.join(','), limit.toString(), time as any);
    if (res.status) return new CodeObj(res.status, res.data, res.msg);
    return new CodeObj(Code.Success, res.data);
  }

  async FeatchUnitOrder (id: string): Promise<CodeObj<OrderResult | null>> {
    const res = await this.state.FCoin.FetchOrderById(id);
    // console.log('FeatchUnitOrder', res);
    if (res.status) return new CodeObj(res.status, null, res.msg);
    return new CodeObj(Code.Success, res.data);
  }

  async CancelUnitOrder (id: string): Promise<CodeObj<{
    price: string,
    fill_fees: string,
    filled_amount: string,
    side: SideEnum,
    type: string,
    created_at: number,
  }>> {
    const res = await this.state.FCoin.OrderCancel(id);
    if (res.status) return new CodeObj(res.status, null as any, res.msg);
    return new CodeObj(Code.Success, res.data);
  }

  async CandleData (symbol: string, resolution = CandleResolution.M1, limit = 20, before = ''): Promise<CodeObj<{
    id: number;
    seq: number;
    high: number;
    low: number;
    open: number;
    close: number;
    count: number;
    base_vol: number;
    quote_vol: number;
  }[]>> {
    const res = await this.state.FCoin.FetchCandle(symbol, resolution, limit, before);
    if (res.status) return new CodeObj(res.status, null as any, res.msg);
    return new CodeObj(Code.Success, res.data);
  }

  async OTC_Fetch () {
    const res = await this.state.FCoin.fetch('GET', 'https://api.fcoin.com/v2/broker/otc/delegation_orders/me', null, {
      // has_prev
      // id: '',
      page_size: 40,
      states: 'trading', //	委托单状态 1 trading 交易中;2 filled 已成交;3 partial_filled 部分成交;4 canceled 已撤销
    });
    if (res.status) return new CodeObj(res.status, null as any, res.msg);
    return new CodeObj(Code.Success, res.data);
  }

  async UpdateOTC (id: string) {
    const res = await this.state.FCoin.fetch('POST', `https://api.fcoin.com/v2/broker/otc/delegation_orders/${id}/refresh`);
    if (res.status) return new CodeObj(res.status, null as any, res.msg);
    return new CodeObj(Code.Success, res.data);
  }
}
export const UserStore = new Store();
// (window as any).UserStore = UserStore;
