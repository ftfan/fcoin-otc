import Vue from 'vue';
import Storage from './storage';

interface WatchData {
  [index: string]: any;
}
const data: WatchData = {};
const vm = new Vue({
  name: 'Store',
  data: {
    data,
  },
  render: (h) => h('div'),
});

if (process.env.NODE_ENV === 'development') {
  const el = document.createElement('div');
  document.body.insertBefore(el, document.body.firstElementChild);
  vm.$mount(el);
}

export default class Data {
  // 当前模块数据
  readonly state: any;

  // 长存状态
  readonly localState: any;

  // session
  readonly sessionState: any;

  protected storages: any = {
    local: null,
    session: null,
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name: string = 'ROOT';

  // 清除当前模块的缓存
  public clear (type: 'all' | 'local' | 'session' = 'all') {
    const local = this.storages.local;
    const session = this.storages.session;
    if (session && type !== 'local') {
      session.clear();
    }
    if (local && type !== 'session') {
      local.clear();
    }
  }

  protected initilization () {
    const module = this;
    vm.$set(vm.data, `${module.name}-state`, this.state);

    if (module.localState) {
      this.createWatchState('local');
    }
    if (module.sessionState) {
      this.createWatchState('session');
    }
  }

  private createWatchState (type: 'session' | 'local') {
    const module = this;
    const State = type === 'session' ? module.sessionState : module.localState;
    const storage = new Storage(module.name, type === 'session' ? sessionStorage : localStorage);
    module.storages[type] = storage;
    const state = storage.get();
    if (state) {
      const keys = Object.keys(state);
      keys.forEach(key => {
        State[key] = state[key];
      });
    }
    // 设置当前模块数据到数据中心内。
    const key = `${module.name}-${type}`;
    vm.$set(vm.data, key, State);
    vm.$watch(function () {
      return this.data[key];
    }, (val, oldVal) => {
      storage.set(val);
    }, {
      deep: true,
    });
  }
}
