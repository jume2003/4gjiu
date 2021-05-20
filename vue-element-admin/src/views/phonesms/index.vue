<template>
  <div>
    <el-container :style="height">
      <el-main>
        <span>

          <img class="fiximg" src="../../assets/skad_images/bindphone.jpg">
          <img class="fiximg" src="../../assets/skad_images/13790102326_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13790099559_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13784144561_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13881536080_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13743769872_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13743778734_957870097.jpg">
        </span>
      </el-main>

      <el-footer>
        <el-input v-model="phone" maxlength="11" type="number" placeholder="请输入手机号" />
        <el-input v-model="smscode" maxlength="4" type="certifycode" placeholder="请输入验证码" />

        <el-container>
          <el-button class="fixbutton" type="primary" @click="clickSmsCode">{{ smststr }}</el-button>
          <el-button class="fixbutton" type="primary" @click="clickLogin">提交</el-button>
        </el-container>
      </el-footer>

    </el-container>
  </div>
</template>

<script>
import { getSms, autSms } from '@/api/sms'
export default {
  data() {
    return {
      phone: '',
      smscode: '',
      smststr: '获取验证码',
      smstime: 0,
      smswait: 20,
      wxuserinfo: {},
      device_code: '',
      out_trade_no: '',
      state_action: '',
      userid: '',
      height: { height: window.innerHeight - 50 + 'px' }
    }
  },
  mounted: function() {
    this.onLoad()
  },
  methods: {
    onLoad() {
      // this.wxuserinfo.openid = '234'
      this.wxuserinfo = this.$route.query.wxuserinfo
      this.device_code = this.$route.query.device_code
      this.out_trade_no = this.$route.query.out_trade_no
      this.state_action = this.$route.query.state_action
      this.userid = this.$route.query.userid
    },
    checkPhone(phone) {
      console.log(phone)
      var reg = /^1[0-9]{10}$/
      return reg.test(phone)
    },
    waitSms() {
      this.smstime++
      this.smststr = (this.smswait - this.smstime)
      if (this.smstime > this.smswait) {
        this.smstime = 0
        this.smststr = '获取验证码'
      } else {
        setTimeout(this.waitSms, 1000)
      }
    },
    clickSmsCode() {
      if (!this.checkPhone(this.phone)) {
        alert('手机号码有误，请重填')
        return
      }
      if (this.smstime !== 0) return
      getSms({ openid: this.wxuserinfo.openid, phone_number: this.phone }).then(response => {
        alert(response.msg)
      })
      this.waitSms()
    },
    clickLogin() {
      if (!this.checkPhone(this.phone)) {
        alert('手机号码有误，请重填')
        return
      }
      autSms({ openid: this.wxuserinfo.openid, tel: this.phone, smscode: this.smscode }).then(response => {
        alert(response.msg)
        if (response.autsms) {
          if (this.state_action === 'scancode') {
            this.$router.replace({ path: '/scancode', query: { wxuserinfo: this.wxuserinfo, device_code: this.device_code, out_trade_no: this.out_trade_no }})
          } else if (this.state_action === 'bindwxcode') {
            this.$router.replace({ path: '/bindwxcode', query: { openid: this.wxuserinfo.openid, userid: this.userid }})
          }
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
