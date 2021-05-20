<template>
  <div class="title-container">
    <h3 class="title" />
  </div>
</template>

<script>
import { getWxUserInfo } from '@/api/user'
import { deviceBind } from '@/api/devices'

export default {
  data() { return {} },

  mounted: function() {
    this.onLoad()
  },
  methods: {
    onLoad() {
      const wxticket = this.$route.query
      if (wxticket.code && wxticket.state) {
        const state_arry = wxticket.state.split(',')
        const state_action = state_arry[0]
        const state_device_code = state_arry[1]
        const userid = state_arry[1]
        const out_trade_no = state_arry[2]
        if (state_action === 'scancode' || state_action === 'bindwxcode' || state_action === 'devicebind') {
          // 向我的服务器发code得到微信用户信息
          getWxUserInfo({ code: wxticket.code, device_code: state_device_code }).then(response => {
            var wxuserinfo = response.wxuserinfo
            var result = response.result
            var msg = response.msg
            if (result) {
              if (wxuserinfo.openid != null) {
                if (wxuserinfo.tel == null) {
                  this.$router.replace({ path: '/phonesms', query: { state_action: state_action, userid: userid, wxuserinfo: wxuserinfo, device_code: state_device_code, out_trade_no: out_trade_no }
                  })
                } else {
                  if (state_action === 'scancode') {
                    this.$router.replace({ path: '/scancode', query: { wxuserinfo: wxuserinfo, device_code: state_device_code, out_trade_no: out_trade_no }})
                  } else if (state_action === 'bindwxcode') {
                    this.$router.replace({ path: '/bindwxcode', query: { openid: wxuserinfo.openid, userid: userid }})
                  } else if (state_action === 'devicebind') {
                    deviceBind({ openid: wxuserinfo.openid, device_code: state_device_code }).then(response => {
                      var msg = response.msg
                      var result = response.result
                      alert(msg)
                      if (result) { this.$router.replace({ path: '/dashboard' }) }
                    })
                  }
                }
              }
            } else {
              alert(msg)
            }
          })
          // window.location.href = 'scancode?token={0}'.format(wxuser.token)
        }
      } else {
        // 跳转商城
      }
    }
  }
}
</script>

<style>
</style>
