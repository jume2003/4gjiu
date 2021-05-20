<template>
  <div>
    <img class="fiximg" src="../../assets/skad_images/13790102326_957870097.jpg">
    <el-input v-model="password" maxlength="11" type="passowrd" placeholder="请输入密码" />
    <el-button class="fixbutton" type="primary" @click="OnBindWx">绑定微信</el-button>
  </div>
</template>

<script>
import { bindwxCode } from '@/api/user'
export default {
  data() {
    return {
      password: '',
      openid: '',
      userid: ''
    }
  },
  mounted: function() {
    this.onLoad()
  },
  methods: {
    filtration(vl) {
      var reg = /[`~!@#$%^&*()_\-+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g
      return reg.test(vl)
    },
    onLoad() {
      this.openid = this.$route.query.openid
      this.userid = this.$route.query.userid
      this.password = ''
    },
    OnBindWx() {
      if (this.password.length < 6) {
        alert('密码不能小于6个字符')
        return
      }
      if (this.filtration(this.username) || this.filtration(this.password)) {
        alert('不能出现特殊符号')
        return
      }
      bindwxCode({ openid: this.openid, userid: this.userid, password: this.password }).then(response => {
        var msg = response.msg
        var result = response.result
        alert(msg)
        if (result) {
          this.$router.replace({ path: '/dashboard' })
        }
      })
    }
  }
}
</script>

<style>
  .fiximg{
    display:block;
    width:100%;
  }

  .fixbutton{
    display:block;
    width:100%;
  }

  .el-header{
    background-color: #000;
    color: #333;
    text-align: center;
    padding: 0px;
  }

  .el-footer {
    background-color: #000;
    color: #333;
    text-align: center;
    padding: 0px;
  }

  .el-main {
    background-color: #000;
    color: #333;
    text-align: center;
    padding: 0px;
  }
</style>
