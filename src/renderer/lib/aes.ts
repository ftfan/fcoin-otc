import { CodeObj, Code } from '../../types/Code';

const cryptico = require('cryptico');
const Bits = 1024;

// 加密
export const EncryptStrByPassword = (password: string, PlainText: string) => {
  const MattsRSAkey = cryptico.generateRSAKey(password, Bits);
  var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);
  var SamsRSAkey = cryptico.generateRSAKey('PassPhrase', Bits);
  const res = cryptico.encrypt(PlainText, MattsPublicKeyString, SamsRSAkey);
  if (res.status !== 'success') return new CodeObj(Code.Error, res, res.status);
  return new CodeObj(Code.Success, res.cipher);
};

// 解密
export const DecryptStrByPassword = (password: string, result: string) => {
  const MattsRSAkey = cryptico.generateRSAKey(password, Bits);
  const res = cryptico.decrypt(result, MattsRSAkey);
  if (res.status !== 'success') return new CodeObj(Code.Error, res, res.status);
  return new CodeObj(Code.Success, res.plaintext);
};
