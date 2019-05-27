<template>
  <el-container>
    <el-main>
      <UserNav v-if="$route.name !== 'UserIndex'"></UserNav>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import UserNav from './nav.vue';
import { UserStore } from '../../store/user';

export default {
  components: { UserNav },
  name: 'User',
}
</script>

<style lang="scss" scoped>

</style>
