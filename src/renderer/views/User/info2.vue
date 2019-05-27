<template>
  <div class="UserInfo">
    <hr>
    <el-button size="small" type="primary" plain @click="FeatchCoins" icon="el-icon-refresh">刷新</el-button>
    <el-button size="small" type="primary" plain @click="TurnToInfo2">划转到交易账户</el-button>
    <hr>
    <el-table :data="tableData" border
      v-loading="loading2"
      ref="multipleTable"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      show-summary @selection-change="handleSelectionChange"
      :summary-method="getSummaries"
      height="600px"
      style="width: 100%">
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column prop="currencyUp" sortable label="名称" width="80" fixed></el-table-column>
      <!-- <el-table-column prop="balanceUsdt" sortable label="折合 USDT"></el-table-column> -->
      <el-table-column prop="balance" label="总余额 / 折合USDT">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">{{ scope.row.source.balance }}</el-tag>
          <el-tag size="mini" type="info">{{ scope.row.balanceUsdt }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="available" label="可用余额 / 折合USDT">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">{{ scope.row.source.available }}</el-tag>
          <el-tag size="mini" type="info">{{ scope.row.availableUsdt }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="frozen" label="冻结余额 / 折合USDT">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">{{ scope.row.source.frozen }}</el-tag>
          <el-tag size="mini" type="info">{{ scope.row.frozenUsdt }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="demand_deposit" label="理财 / 折合USDT">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">{{ scope.row.source.demand_deposit }}</el-tag>
          <el-tag size="mini" type="info">{{ scope.row.demand_depositUsdt }}</el-tag>
        </div>
      </el-table-column>
      <el-table-column prop="lock_deposit" label="锁仓 / 折合USDT">
        <div slot-scope="scope">
          <el-tag size="mini" type="primary">{{ scope.row.source.lock_deposit }}</el-tag>
          <el-tag size="mini" type="info">{{ scope.row.lock_depositUsdt }}</el-tag>
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

export default {
  name: 'UserInfo',

  data () {
    return {
      loading2: false,
      timer: 0,
      multipleSelection: [],
      tableData: [],
    };
  },

  computed: {
    Key () { return UserStore.localState.FcoinConf.Key; },
  },

  methods: {
    async TurnToInfo2 () {
      const data = this.multipleSelection.map(item => {
        return { currency: item.currency, amount: item.source.available };
      });
      console.log(data);
      this.loading2 = true;
      const ress = await Promise.all(data.map(item => UserStore.Assets2Spot(item.currency, item.amount)));
      this.loading2 = false;
      for (const i in ress) {
        const res = ress[i];
        if (res.status) this.$message.error(res.msg);
      }
      this.$message.success('划转成功');
      this.FeatchCoins();
    },
    handleSelectionChange (val) {
      this.multipleSelection = val;
    },
    async FeatchCoins () {
      this.loading2 = true;
      const res = await UserStore.FeatchCoins2();
      this.loading2 = false;
      if (res.Error()) this.$message.warning(res.Msg);
      const Coins = clone(UserStore.state.Coins2);
      const usdt = RunnerStore.localState.SymbolLastInfo.usdt;
      const data = Coins.map(data => {
        let balanceUsdt = 0;
        let availableUsdt = 0;
        let frozenUsdt = 0;
        let demand_depositUsdt = 0;
        let lock_depositUsdt = 0;
        let type = '';
        if (usdt[data.currency]) {
          const LastPrice = usdt[data.currency].ticker.LastPrice;
          balanceUsdt = Math2.mul(data.balance, LastPrice);
          availableUsdt = Math2.mul(data.available, LastPrice);
          frozenUsdt = Math2.mul(data.frozen, LastPrice);
          demand_depositUsdt = Math2.mul(data.demand_deposit, LastPrice);
          lock_depositUsdt = Math2.mul(data.lock_deposit, LastPrice);
        }
        return Object.assign({}, data, {
          currencyUp: data.currency.toLocaleUpperCase(),
          balanceUsdt, frozenUsdt, availableUsdt, demand_depositUsdt, lock_depositUsdt,
          type,
        });
      });
      data.sort((a, b) => {
        if (a.balanceUsdt > b.balanceUsdt) return -1;
        if (a.balanceUsdt < b.balanceUsdt) return 1;
        return 0;
      });
      this.tableData = data;
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合';
          return;
        }
        if (column.property === 'frozen') {
          const value = Math2.add(0, ...data.map(item => item.frozenUsdt));
          sums[index] = `${value} USDT`;
        } else if (column.property === 'available') {
          const value = Math2.add(0, ...data.map(item => item.availableUsdt));
          sums[index] = `${value} USDT`;
        } else if (column.property === 'balance') {
          const value = Math2.add(0, ...data.map(item => item.balanceUsdt));
          sums[index] = `${value} USDT`;
        } else if (column.property === 'balanceUsdt') {
          const value = Math2.add(0, ...data.map(item => item.balanceUsdt));
          sums[index] = `${value} USDT`;
        } else if (column.property === 'demand_deposit') {
          const value = Math2.add(0, ...data.map(item => item.demand_depositUsdt));
          sums[index] = `${value} USDT`;
        } else if (column.property === 'lock_deposit') {
          const value = Math2.add(0, ...data.map(item => item.lock_depositUsdt));
          sums[index] = `${value} USDT`;
        }
      });

      return sums;
    },
  },

  destroyed () {
    clearInterval(this.timer);
  },

  async created () {
    // this.timer = setInterval(() => {
    //   this.FeatchCoins();
    // }, 10000);
    await this.FeatchCoins();
  },
}
</script>

<style lang="scss" scoped>

</style>
