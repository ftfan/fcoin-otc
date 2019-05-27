import Vue from 'vue';
import Router from 'vue-router';

(require as any).context('./views', true, /[\w\W]+\.vue$/);
Vue.use(Router);

const VueRouter = new Router({
  routes: [
    // 入口
    { path: '/', name: 'Index', component: require('./views/index.vue').default },

    // 用户中心
    { path: '/user', component: require('./views/User/template.vue').default, children: [
      { path: 'index', name: 'UserIndex', component: require('./views/User/index.vue').default },
      { path: 'info', name: 'UserInfo', component: require('./views/User/info.vue').default },
      { path: 'info2', name: 'UserInfo2', component: require('./views/User/info2.vue').default },
      { path: 'otc', name: 'UserOtc', component: require('./views/User/otc.vue').default },
    ]},
  ],
  mode: 'hash',
});

export default VueRouter;
