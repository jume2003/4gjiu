<template>
  <div>
    <el-container :style="height">
      <el-main>
        <span>
          <el-carousel width="100%" height="350px">
            <el-carousel-item v-for="item in img_list" :key="item">
              <img :src="item" width="100%" height="100%">
            </el-carousel-item>
          </el-carousel>
        </span>
        <span>
          <img class="fiximg" src="../../assets/skad_images/13790102326_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13790099559_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13784144561_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13881536080_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13743769872_957870097.jpg">
          <img class="fiximg" src="../../assets/skad_images/13743778734_957870097.jpg">
        </span>
      </el-main>

      <el-footer>
        <el-container>
          <el-button class="fixbutton" type="primary" @click="onFreetry">免费试喝</el-button>
          <el-button class="fixbutton" type="primary" @click="onBuy">马上购买</el-button>
        </el-container>
      </el-footer>
    </el-container>

  </div>

</template>

<style>
  .fiximg{
    display:block;
    width:100%;
  }

  .fixbutton{
    display:block;
    width:100%;
    height: 50px;
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

<script>
import { freeTry } from '@/api/devices'
import { BindCode, BindRotemIndex, createOrderTemp } from '@/api/ordertemp'

export default {

  data() {
    return {
      img_list: ['http://sh.zssk.net/upload/imgs/1.jpg', 'http://sh.zssk.net/upload/imgs/2.jpg', 'http://sh.zssk.net/upload/imgs/3.jpg', 'http://sh.zssk.net/upload/imgs/4.jpg'],
      height: { height: window.innerHeight + 'px' },
      wxuserinfo: null,
      device_code: '',
      out_trade_no: '',
      ortem_index: 0
    }
  },
  mounted: function() {
    this.onLoad()
  },
  methods: {
    onLoad() {
      this.wxuserinfo = this.$route.query.wxuserinfo
      this.device_code = this.$route.query.device_code
      this.out_trade_no = this.$route.query.out_trade_no
      this.OnCreateRotem()
      document.querySelector('body').setAttribute('style', 'background:#000;')
    },
    onFreetry() {
      freeTry({ wxuser: this.wxuserinfo, devcode: this.device_code }).then(response => {
        var msg = response.msg
        alert(msg)
      })
    },
    onBuy() {
      this.$router.replace({
        path: '/wxpay',
        query: {
          wxuserinfo: this.wxuserinfo,
          device_code: this.device_code,
          out_trade_no: this.out_trade_no
        }
      })
    },
    OnCreateRotem() {
      createOrderTemp({ device_code: this.device_code, openid: this.wxuserinfo.openid }).then(response => {
        var msg = response.msg
        var result = response.result
        if (result) {
          this.ortem_index = response.ortem_index
          this.OnBindRotemIndex()
        } else {
          alert(msg)
        }
      })
    },
    OnBindRotemIndex() {
      BindRotemIndex({ ortem_index: this.ortem_index, openid: this.wxuserinfo.openid }).then(response => {
        var msg = response.msg
        var result = response.result
        if (result) { alert(msg) }
      })
    },
    OnBindCode() {
      BindCode({ out_trade_no: this.out_trade_no, openid: this.wxuserinfo.openid }).then(response => {
        var msg = response.msg
        var result = response.result
        if (result) { alert(msg) }
      })
    }
  }

}

</script>
