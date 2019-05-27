<template>
  <div class="UserIndex">
    <template v-if="FirstLogin">
      <el-tag size="mini" type="info">
        【设置密码】是设置下次登录该软件的密码（该密码用作 加密/解密 您输入的Key与Secret），每次开启软件时都需要输入密码。
      </el-tag>

      <el-input class="elinput" placeholder="FCoin API Key" v-model="Key">
        <template slot="prepend"><div class="txt">FCoin Key</div></template>
        <el-popover slot="suffix"
          placement="top-start"
          title="FCoin Key" width="300" trigger="hover"
          content="登录FCoin网站后,访问：https://exchange.fcoin.com/settings/api 设置获得">
          <i slot="reference" class="elicon el-icon-question"></i>
        </el-popover>
      </el-input>

      <el-input class="elinput" placeholder="FCoin API Secret" v-model="Secret">
        <template slot="prepend"><div class="txt">FCoin Secret</div></template>
        <el-popover slot="suffix"
          placement="top-start"
          title="FCoin API Secret" width="300" trigger="hover"
          content="登录FCoin网站后,访问：https://exchange.fcoin.com/settings/api 设置获得。注意！复制后做好备份，这个秘钥FCoin也无法二次查看，只能删除重建。">
          <i slot="reference" class="elicon el-icon-question"></i>
        </el-popover>
      </el-input>

      <el-input class="elinput" placeholder="请设置一个密码，下次登录使用（不是FCoin密码）" v-model="Password">
        <template slot="prepend"><div class="txt">设置密码</div></template>
        <el-popover slot="suffix"
          placement="top-start"
          title="设置密码" width="300" trigger="hover"
          content="设置一个密码，方便下次打开软件时校验身份，避免被他人误操作">
          <i slot="reference" class="elicon el-icon-question"></i>
        </el-popover>
      </el-input>
    </template>

    <el-input ref="Password" v-else class="elinput" placeholder="请输入密码" @keyup.native.enter="Submit" v-model="Password" :type="FirstLogin ? 'text' : 'password'">
      <template slot="prepend"><div class="txt">密码</div></template>
      <el-popover slot="suffix"
        placement="top-start"
        title="密码" width="300" trigger="hover"
        content="首次登录时，设置的密码">
        <i slot="reference" class="elicon el-icon-question"></i>
      </el-popover>
    </el-input>

    <el-input ref="Proxy" class="elinput" placeholder="非必填项，示例 127.0.0.1:50002" @keyup.native.enter="Submit" v-model="HttpProxy" type="text">
      <template slot="prepend"><div class="txt">HTTP代理</div></template>
      <el-popover slot="suffix"
        placement="top-start"
        title="HTTP接口请求代理设置" width="300" trigger="hover"
        content="如果本地网络欠佳，使用翻墙软件，填写翻墙软件的代理地址。（请自行保证代理的可信任度）">
        <i slot="reference" class="elicon el-icon-question"></i>
      </el-popover>
    </el-input>

    <el-button @click="ReSet" class="resetBtn">{{ FirstLogin ? '返回登录' : '重置账号' }}</el-button>
    <el-button @click="Submit" :loading="Loading" class="loginBtn" type="primary" icon="el-icon-success">{{ FirstLogin ? '完成设置' : '登 录' }}</el-button>
  </div>
</template>

<script>
import { UserStore } from '../../store/user';
import { sleep } from '../../lib/utils';
import { NotificationUrl } from '../../lib/Notification';
import { FCoinStore } from '../../store/fcoin';
export default {
  name: 'UserIndex',

  beforeRouteEnter: (to, from, next) => {
    if (to.query.FirstLogin === '1') return next(vm => {
      vm.FirstLogin = true;
    });
    if (UserStore.sessionState.Login) return next({ name: 'UserInfo' });
    return next();
  },

  mounted () {
    if (!this.FirstLogin && this.$refs.Password) {
      console.log('focus');
      this.$refs.Password.focus();
    }
  },

  data () {
    return {
      HttpProxy: UserStore.localState.Proxy.Http.host ? `${UserStore.localState.Proxy.Http.host}:${UserStore.localState.Proxy.Http.port}` : '',
      Key: '',
      Secret: '',
      Password: '',
      Loading: false,
      FirstLogin: !UserStore.localState.FcoinConf.Key,
    };
  },

  methods: {
    ReSet () {
      this.FirstLogin = !this.FirstLogin;
    },

    ProxyGet () {
      if (this.HttpProxy.trim()) {
        const proxy = this.HttpProxy.trim().replace('http://', '').replace('https://', '').split(':');
        UserStore.localState.Proxy.Http.host = proxy[0] || '';
        UserStore.localState.Proxy.Http.port = proxy[1] || '';
      } else {
        UserStore.localState.Proxy.Http.host = '';
        UserStore.localState.Proxy.Http.port = '';
      }
    },

    async Submit () {
      this.ProxyGet();
      FCoinStore.Reload();

      if (!this.FirstLogin) {
        this.Loading = true;
        await sleep(20);
        await this.Login();
        this.Loading = false;
        return;
      }

      if (!this.Key) return this.$message.warning('FCoin Key 是必填项！');
      if (!this.Secret) return this.$message.warning('FCoin Secret 是必填项！');
      this.Loading = true;
      await sleep(20);
      const res = await UserStore.SetApiInfo(this.Key, this.Secret, this.Password);
      this.Loading = false;
      if (res.Error()) return this.$message.warning(res.Msg);
      this.LoginSuccess();
    },

    async Login () {
      this.Loading = true;
      await sleep(20);
      const res = await UserStore.Login(this.Password);
      this.Loading = false;
      if (res.Error()) return this.$message.warning(res.Msg);
      this.LoginSuccess();
    },

    async LoginSuccess () {
      this.$message.success('登录成功');
      console.log('11111');
      this.$router.replace({ name: 'UserInfo' });
    },

    async GetRegPwd () {
      NotificationUrl();
    },
  },
}
</script>

<style lang="scss" scoped>
.UserIndex{ max-width: 600px; margin: auto; }
.txt{ width: 70px; text-align: right; }
.title{ text-align: center; }
.elinput{ margin-top: 30px; }
.elicon{ font-size: 24px; margin-top: 8px; }
.loginBtn{ margin-top: 40px; width: 100%; }
.resetBtn{ margin-top: 40px; }
.resetBtn+.loginBtn{ width: 80%; }
</style>
