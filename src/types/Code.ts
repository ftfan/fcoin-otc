
export enum Code {
  Success = 0,
  Undefined = 404,
  Error = 500,
  NetError = 10001,
  PasswordError = 10002, // 密码不正确
}

export function isCodeObj (data: any): data is CodeObj<any> {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  if (!('Code' in data)) return false;
  return true;
}

export class CodeObj<T> {
  Code!: Code;
  Data!: T;
  Msg!: string;

  constructor (arg: Code | CodeObj<T>, data?: T, msg?: string) {
    this.Msg = '';
    if (typeof arg === 'number') {
      this.Code = arg;
      if (data) this.Data = data;
      if (msg) this.Msg = msg;
      return;
    }
    if (typeof arg === 'string') {
      this.Code = 500;
      if (data) this.Data = data;
      if (msg) this.Msg = msg;
      return;
    }

    if ('Code' in arg) this.Code = arg.Code;
    if ('Data' in arg) this.Data = arg.Data;
    if ('Msg' in arg) this.Msg = arg.Msg;
  }

  Error () {
    const res = this.Code !== Code.Success;
    if (res) {
      // console.error(this);
    }
    return res;
  }

  Query () {
    return {
      Code: String(this.Code),
      Msg: String(this.Msg),
    };
  }
}

export interface PageArg {
  Index: number;
  Total: number;
  Size: number;
}
