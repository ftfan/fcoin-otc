
export default class Storage {
  private storage = window.localStorage;
  private namespace = 'root';

  constructor (namespace: string | string[], storage?: any) {
    if (storage) {
      this.storage = storage;
    }
    if (typeof namespace === 'string') {
      this.namespace = namespace;
    } else {
      this.namespace = namespace.join(':');
    }
  }

  // 清除指定模块的缓存
  static ClearLocalStorageByNps (namespace: string | string[]) {
    Storage.ClearNsp(window.localStorage, namespace);
  }

  // 清除指定模块的缓存
  static ClearSessionStorageByNps (namespace: string | string[]) {
    Storage.ClearNsp(window.sessionStorage, namespace);
  }

  static ClearNsp (storage: any, namespace: string | string []) {
    let nsp = '';
    if (typeof namespace === 'string') {
      nsp = namespace;
    } else {
      nsp = namespace.join(':');
    }
    nsp = '^' + nsp;

    const vals = storage.valueOf();
    const keys = Object.keys(vals);
    keys.forEach((key) => {
      if (key.match(nsp)) {
        storage.remove(key);
      }
    });
  }

  // 清除当前模块的数据
  public clear () {
    Storage.ClearNsp(this.storage, this.namespace);
  }

  public remove (key: string) {
    const k = this.realKey(key);
    this.storage.removeItem(k);
  }

  public set (val: any) {
    const k = this.namespace;
    if (val === undefined) {
      this.remove(k);
      return;
    }
    this.storage.setItem(k, this.serialize(val));
    return;
  }

  public get () {
    const k = this.namespace;
    return this.deserialize(this.storage.getItem(k));
  }

  private serialize (value: any) {
    return JSON.stringify(value);
  }

  private deserialize (value: any) {
    if (typeof value !== 'string') {
      return undefined;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value || undefined;
    }
  }

  private realKey (key: string) {
    return this.namespace + ':' + key;
  }
}
