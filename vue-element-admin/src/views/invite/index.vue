<template>
  <div>
    <img class="fiximg" src="../../assets/skad_images/13790102326_957870097.jpg">
    <el-input v-model="name" maxlength="20" type="text" placeholder="请输入用户名(酒店名)" />
    <el-input v-model="username" maxlength="11" type="text" placeholder="请输入账号" />
    <el-input v-model="password" maxlength="11" type="passowrd" placeholder="请输入密码" />
    <el-button class="fixbutton" type="primary" @click="OnRegister">注册</el-button>
  </div>
</template>

<script>
import { InviteCreate } from '@/api/user'
export default {
  data() {
    return {
      name: '',
      username: '',
      password: '',
      inviteid: ''
    }
  },
  mounted: function() {
    this.onLoad()
  },
  methods: {
    filtration(vl) {
      var reg = /[ `~!@#$%^&*()_\-+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g
      return reg.test(vl)
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login`)
    },
    onLoad() {
      console.log(this.$route.query)
      this.inviteid = this.$route.query.inviteid
      this.name = ''
      this.username = ''
      this.password = ''
    },
    OnRegister() {
      if (this.username.length < 4) {
        alert('账号不能小于4个字符')
        return
      }
      if (this.password.length < 6) {
        alert('密码不能小于6个字符')
        return
      }
      if (this.name.length < 4) {
        alert('用户名小于4个字符')
        return
      }
      if (this.filtration(this.username) || this.filtration(this.password) || this.filtration(this.name)) {
        alert('不能出现特殊符号和空格')
        return
      }
      InviteCreate({ inviteid: this.inviteid, username: this.username, password: this.password, name: this.name }).then(response => {
        var msg = response.msg
        var result = response.result
        var url = response.url
        alert(msg)
        if (result) {
          window.location = url
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
