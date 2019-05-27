<template>
  <el-form label-width="200px">
    <el-form-item v-for="(item, index) in data" :key="index" :label="item.name">
      <el-input size="small" v-model="item.value" :type="item.type"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { clone, sleep } from '../lib/utils';
import Math2 from '../../renderer/lib/math2';
const dateformat = require('dateformat-util');

export default {
  name: 'Inuts',

  props: {
    data: { type: Array, default: () => [] },
  },

  data () {
    return {
      temp: [],
    };
  },
}
</script>

<style lang="scss" scoped>
// .orderdiv{ padding-top: 10px; }
</style>
