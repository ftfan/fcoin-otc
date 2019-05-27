<template>
  <el-container>
    <el-main class="main">
      <!-- <img src="../assets/new.jpg"> -->
      <el-button type="primary" @click="$router.replace({ name: 'UserIndex' })">登录</el-button>
      <!-- <el-tag type="info">试用版</el-tag> -->
      <!-- <ul>
        <li>当前阶段：内测阶段</li>
        <li>待开发功能功能规划：</li>
        <li>  判断软件版本，后期加入自动更新版本等功能；</li>
        <li>  显示重要信息，使用帮助、引导。</li>
        <li>  提供默认的量化策略；</li>
        <li>  更自由的自定义策略；</li>
        <li>  回测；</li>
        <li>查看订单功能，分解、时间太久的订单用其他方法更新；</li>
        <li>删除策略功能，移除查看订单的时间控件；</li>
        <li>策略的交易对可自由选择交易专区（通过暗号获取对应专区的秘钥解锁）</li>
        <li>盈利计算方式待优化。</li>
        <li>报错信息保存-事件日志</li>
      </ul> -->
    </el-main>
  </el-container>
</template>

<script>
// import { ipcRenderer } from 'electron';

export default {
  name: 'Index',
  created () {
    this.$router.push({ name: 'UserIndex' });
    // alert(Notification.isSupported());

    // ipcRenderer.on("message", (event, text) => {
    //   // console.log(event);
    //   this.$message.warning(text);
    // });
    // ipcRenderer.on("downloadProgress", (event, progressObj) => {
    //   console.log(progressObj);
    //   this.downloadPercent = progressObj.percent || 0;
    // });
    // ipcRenderer.on("isUpdateNow", () => {
    //   ipcRenderer.send("isUpdateNow");
    // });
  }
}
</script>

<style lang="scss" scoped>
.main{
  text-align: center;
}
img{ display: block; margin: 40px auto; }
pre{
  text-align: left;
}
ul{ text-align: left; }
</style>
