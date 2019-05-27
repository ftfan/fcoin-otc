<template>
  <el-menu :default-active="RouteName" class="el-menu-demo"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    mode="horizontal" @select="handleSelect">
    <el-menu-item index="UserInfo" title="FCoin 交易账户 内的资产">交易账户</el-menu-item>
    <el-menu-item index="UserInfo2" title="FCoin 钱包账户 内的资产">钱包账户</el-menu-item>
    <el-menu-item index="UserOtc">OTC</el-menu-item>
    <el-menu-item index="UserIndex">退出登录</el-menu-item>
  </el-menu>
</template>

<script>
import { UserStore } from '../../store/user';

export default {
  name: 'UserNav',

  computed: {
    RouteName () { return this.$route.name; },
  },

  methods: {
    handleSelect (name) {
      if (name === 'UserIndex') UserStore.LoginOut();
      this.$router.replace({ name });
    },
  },
}
</script>

<style lang="scss" scoped>

.nav{ background-color: #999; height: 100%; }
</style>
