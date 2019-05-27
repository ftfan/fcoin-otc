import Data from '../lib/data';

class Store extends Data {
  // 刷新后依旧留存的状态
  readonly localState = {
    text: '',
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `app`;

  constructor () {
    super();
    this.initilization();
  }
}

export const AppStore = new Store();
