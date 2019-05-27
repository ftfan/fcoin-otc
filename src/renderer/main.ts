import Vue from 'vue'
import VueRouter from './router';
import Element from 'element-ui';
import { Decimal } from 'decimal.js/decimal';
console.log(Decimal);

import 'element-ui/lib/theme-chalk/index.css';
import './assets/index.scss';
import './lib/api';
// import './lib/echarts.min.js';
import { MenuItemConstructorOptions, remote } from 'electron';
import { RegisterDebugger } from './lib/debug';
import { UserStore } from './store/user';
const { Menu, MenuItem } = remote;
window.onerror = (event: Event | string, source?: string, fileno?: number, columnNumber?: number, error?: Error) => {
  alert(`${event}-${source}-${fileno}-${columnNumber}-${error}`);
};
Vue.use(Element);

Vue.config.productionTip = true;

const requireComponent = (require as any).context('./components/global', true, /[\w\W]+\.vue$/);
requireComponent.keys().forEach((path: string) => {
  const name = path.replace('./', '').replace('.vue', '');
  Vue.component(name, requireComponent(path).default);
});

new Vue({
  router: VueRouter,
  render: (h) => h('router-view'),
}).$mount('#app');

VueRouter.beforeEach((to, from, next) => {
  if (to.name === 'Index') return next();
  if (to.name === 'UserIndex') return next();
  if (to.name === 'HiveCapitalIndex') return next();
  if (UserStore.sessionState.Login) return next();
  next({ name: 'UserIndex' });
});

(window as any).Vue = Vue;

const menu = new Menu();

const Menus: MenuItemConstructorOptions[] = [
  { role: 'copy', label: '复制' },
  { role: 'paste', label: '粘贴' },
  { type: 'separator' },
  { role: 'reload', label: '刷新界面' },
];
Menus.forEach(item => menu.append(new MenuItem(item)));

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup({window: remote.getCurrentWindow()})
}, false);

RegisterDebugger();
//   if (IsDebugger()) {
//   RegisterDebugger();
// }
