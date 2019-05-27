<template>
  <div class="UserInfo">
    <hr>
    <!-- <el-button size="small" type="primary" plain @click="OTC_Fetch" icon="el-icon-refresh">刷新列表</el-button> -->
    <!-- <el-button size="small" type="primary" plain @click="TurnToInfo2">划转到钱包</el-button> -->
    <div style="width:400px;">
      <el-tag size="mini">刷新委托单列表频次（{{ timeUpdate }} 秒，每次获取最新委托单列表时遇到可刷新的委托单，会自动刷新委托单）</el-tag><br>
      <el-tag size="mini">下次获取最新列表：{{ dateformat.format(Now, 'yyyy-MM-dd hh:mm:ss') }}</el-tag>
      <el-slider :min="5" v-model="timeUpdate" :step="1" show-input></el-slider>
    </div>
    <hr>
    <el-table :data="tableData" border size="mini"
      v-loading="loading2"
      ref="multipleTable"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      height="600px"
      style="width: 100%">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="direction" sortable label="买卖" width="80">
        <div slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.direction === 'buy'" type="primary">买</el-tag>
          <el-tag size="mini" v-else type="warning">卖</el-tag><br>
        </div>
      </el-table-column>
      <el-table-column prop="price" label="单价" width="60"></el-table-column>
      <el-table-column prop="state" label="委托单状态" width="130">
        <div slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.state === 'submited'" type="info">已提交</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'confirmed'" type="info">已确认</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'partial_filled'" type="info">部分成交</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'partial_canceled'" type="info">部分成交（已撤单）</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'filled'" type="info">完全成交</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'canceled'" type="info">已撤销</el-tag>
          <el-tag size="mini" v-if="scope.row.state === 'system_canceled'" type="info">系统撤销（余额不足）</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="amount" label="数量">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">总：{{ parseFloat(scope.row.amount) }}</el-tag><br>
          <el-tag size="mini" type="success">已完成：{{ parseFloat(scope.row.filled_amount) }}</el-tag><br>
          <el-tag size="mini" type="info">未处理：{{ parseFloat(scope.row.unprocessed_amount) }}</el-tag><br>
          <el-tag size="mini" v-if="parseFloat(scope.row.processing_amount) > 0" type="warning">处理中：{{ parseFloat(scope.row.processing_amount) }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="total_amount" label="总金额、总数量" width="140">
        <div slot-scope="scope">
          <el-tag size="mini" type="info">{{ parseFloat(scope.row.total_amount) }} {{ scope.row.legal_currency.toUpperCase() }}</el-tag><br>
          <el-tag size="mini" type="info">{{ parseFloat(scope.row.amount) }} {{ scope.row.currency.toUpperCase() }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column label="交易限制">
        <div slot-scope="scope">
          <el-tag size="mini" type="info">最小金额：{{ scope.row.min_limit }}</el-tag><br>
          <el-tag size="mini" type="info">最大金额：{{ scope.row.max_limit }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="amount" label="时间">
        <div slot-scope="scope">
          <el-tag size="mini" type="info">创建时间：{{ dateformat.format(new Date(scope.row.created_at), 'yyyy-MM-dd hh:mm:ss') }}</el-tag><br>
          <el-tag size="mini" type="info">最近刷新：{{ dateformat.format(new Date(scope.row.refresh_at), 'yyyy-MM-dd hh:mm:ss') }}</el-tag><br>
          <el-tag size="mini" type="success">下次刷新：{{ dateformat.format(new Date(scope.row.next_refresh_at), 'yyyy-MM-dd hh:mm:ss') }}</el-tag>
          <!-- <el-tag size="mini">{{ parseInt(Math.max(0, (scope.row.next_refresh_at - Now)) / 1000) }}</el-tag> -->
        </div>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { UserStore } from '../../store/user';
import { RunnerStore } from '../../store/runner';
import Math2 from '../../../renderer/lib/math2';
import { clone } from '../../lib/utils';
import { FCoinStore } from '../../store/fcoin';
const dateformat = require('dateformat-util');

export default {
  name: 'UserOtc',

  data () {
    return {
      timeUpdate: 10,
      dateformat,
      loading2: false,
      timer: 0,
      tableData: [],
      Now: Date.now(),
    };
  },

  methods: {
    async OTC_Fetch () {
      this.loading2 = true;
      const res = await UserStore.OTC_Fetch();
      this.loading2 = false;
      if (res.Error()) this.$message.warning(res.Msg);
      console.log(res.Data);
      res.Data.content.sort((a, b) => {
        const pa = parseFloat(a.price);
        const pb = parseFloat(b.price);
        if (pa > pb) return -1;
        if (pa < pb) return 1;
        if (a.direction > b.direction) return -1;
        if (a.direction < b.direction) return 1;
        return 0;
      });
      this.tableData = res.Data.content;
      const Now = Date.now();
      const refs = res.Data.content.filter(item => item.next_refresh_at < Now);
      let sum = 0;
      await Promise.all(refs.map(async item => {
        const res = await UserStore.UpdateOTC(item.id);
        if (res.Error()) return this.$message.warning(res.Msg);
        sum++;
      }));

      if (sum > 0) this.$message.success(`成功刷新 ${sum} 个委托单`);
      this.timer = setTimeout(() => {
        this.OTC_Fetch();
      }, this.timeUpdate * 1000);
      this.Now = new Date(Date.now() + this.timeUpdate * 1000);
    },
  },

  destroyed () {
    clearInterval(this.timer);
  },

  async created () {
    this.OTC_Fetch();
  },
}
</script>

<style lang="scss" scoped>

</style>
