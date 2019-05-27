const { Menu, app } = require('electron')
const { ClientApi } = require('./api');

// 创建
ClientApi.on('/FCoin/Create', (event, arg) => {
  if (!arg || !arg.Key || !arg.Secret) return event.returnValue = false;
  event.returnValue = arg.Key;
});

const template = [
  {
    label: 'OTC专用版',
    enabled: false
  },
  { label: '|', enabled: false },
  // { label: app.getName(),
  //   submenu: [
  //     { label: '关于 ' + app.getName(), role: 'about' },
  //     { label: '退出', accelerator: 'Command+Q', click: () => app.quit() },
  //   ],
  // },
  // { label: '|', enabled: false },
  {
    label: `${app.getName()}: ${app.getVersion()}`,
    enabled: false,
    // click: () => require('electron').shell.openExternal('https://github.com/hivecapital/hivecapital.github.io'),
  },
];

export const menu = Menu.buildFromTemplate(template);

console.log('menu ok');
