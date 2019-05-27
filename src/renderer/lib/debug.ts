import { ipc } from './api';

export const IsDebugger = () => {
  const is = ipc.emit('Sys.IsDebug', null);
  if (is) console.log('IsDebug', is);
  return is;
};

export const RegisterDebugger = () => {
  window.addEventListener('keyup', (arg) => {
    console.log(arg);
    if (!arg) return;
    if (arg.key === 'F12') {
      ipc.emit('/Open/F12', null);
      arg.stopPropagation();
      return;
    }
  }, true);
};
