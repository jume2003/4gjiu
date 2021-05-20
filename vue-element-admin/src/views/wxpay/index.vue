<template>
  <div class="title-container">
    <el-container :style="height">
      <el-header>
        <img class="fiximg" src="../../assets/skad_images/header_log.jpg">
      </el-header>
      <el-main>
        <el-table :data="products_list" style="width:100%">
          <el-table-column prop="imgurl" :label="$t('table.product_imgurl')">
            <template slot-scope="scope" width="70px">
              <img style="width:70px;height:70px;border:none;" :src="scope.row.imgurl">
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="$t('table.name')" width="100pix" />
          <el-table-column prop="price" :label="$t('table.price')" width="70pix" />

          <el-table-column>
            <template slot-scope="scope">
              <div class="car-num">
                <img src="../../assets/car_images/jian.png" alt="" class="num-icon" @click="onSub(scope.row)">
                <span class="car-nums">{{ scope.row.count }}</span>
                <img src="../../assets/car_images/jia.png" alt="" class="num-icon" @click="onAdd(scope.row)">
              </div>
            </template>
          </el-table-column>

        </el-table>
      </el-main>
    </el-container>
    <el-footer>
      <div class="car-btm">
        <div class="all-money">共计：￥{{ total_price }}</div>
        <div class="pay" @click="onPay()">结算</div>
      </div>
    </el-footer>

  </div>
</template>

<script>
import wx from 'weixin-jsapi'
import { getWxJsSdkInfo } from '@/api/user'
import { wxcreateOrder } from '@/api/order'
import { fetchProduct } from '@/api/product'

export default {
  data() {
    return {
      height: { height: window.innerHeight - 50 + 'px' },
      products_list: null,
      total_price: 0

    }
  },
  mounted: function() {
    this.onLoad()
  },
  methods: {
    onLoad() {
      fetchProduct({}).then((response) => {
        for (var i in response.data.list) {
          response.data.list[i].count = 0
        }
        this.products_list = response.data.list
        this.products_total = response.data.total
        console.log(response.data)
      })
      getWxJsSdkInfo(window.location.href).then(response => {
        const jstick = response.jssdktick
        console.log(jstick.signature)
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: jstick.appid, // 必填，公众号的唯一标识
          timestamp: jstick.timestamp, // 必填，生成签名的时间戳
          nonceStr: jstick.noncestr, // 必填，生成签名的随机串
          signature: jstick.signature, // 必填，签名，见附录1
          jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'chooseWXPay'
          ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        })
        wx.ready(function() { // 需在用户可能点击分享按钮前就先调用
          wx.checkJsApi({
            jsApiList: ['chooseWXPay'],
            success: res => {
              console.log('checked api:', res)
            },
            fail: err => {
              console.log('check api fail:', err)
            }
          })
        })
      })
    },
    onAdd(product) {
      product.count++
      this.onPrice()
      console.log(product)
    },
    onSub(product) {
      product.count--
      if (product.count <= 0) product.count = 0
      this.onPrice()
      console.log(product)
    },
    onPrice() {
      this.total_price = 0
      console.log(this.products_list)
      for (var i in this.products_list) {
        this.total_price += this.products_list[i].price * 100 * this.products_list[i].count
      }
      this.total_price = this.total_price / 100
    },
    onPay() {
      const openid = this.$route.query.wxuserinfo.openid
      const tel = this.$route.query.wxuserinfo.tel
      const device_code = this.$route.query.device_code
      const out_trade_no = this.$route.query.out_trade_no
      var products = []
      for (var i in this.products_list) {
        var unproduct = this.products_list[i]
        if (unproduct.count !== 0) { products.push({ product_id: unproduct._id, count: unproduct.count }) }
      }
      if (products.length !== 0) {
        wxcreateOrder({ order: { tel: tel, device_code: device_code, out_trade_no: out_trade_no, openid: openid, products: products, type: 'ortemindex' }}).then(response => {
          var payinfo = response.data.payinfo
          var jsbinfo = response.data.jsbinfo
          console.log(payinfo)
          console.log(jsbinfo)
          wx.chooseWXPay({
            'timestamp': jsbinfo.timeStamp,
            'nonceStr': jsbinfo.nonceStr,
            'package': jsbinfo.package,
            'signType': jsbinfo.signType,
            'paySign': jsbinfo.paySign,
            // 支付成功后的回调函数
            success: function(res) {
              // alert('成功')
            },
            // 支付取消回调函数
            cencel: function(res) {
              // alert('用户取消支付~')
            },
            // 支付失败回调函数
            fail: function(res) {
              // alert('支付失败~')
            },
            complete: function(res) {
              // alert('完成')
            }
          })
        })
      }
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
    height: 40px;
  }

  .el-header{
    background-color: #ffffff;
    color: #333;
    text-align: center;
    padding: 0px;
  }

  .el-footer {
    background-color: #ffffff;
    color: #333;
    text-align: center;
    padding: 0px;
  }
  .el-main {
    background-color: #ffffff;
    color: #333;
    text-align: center;
    padding: 0px;
  }
  .car-num{
      display: flex;
      align-items: center;
      justify-content: center;
  }
  .car-nums{
      width:30px;
      text-align: center;
  }
  .num-icon{
      width:25px;
      height:25px;
      border-radius:2px;
  }
  .car-btm{
      width:100%;
      height:60px;
      background:#fff;
      position: fixed;
      bottom:0;
      left:0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size:16px;
      color:#333;
  }
  .btm-fl{
      padding-left:18px;
      display: flex;
      align-items: center;
  }
  .pay{
      width:120px;
      text-align: center;
      line-height:60px;
      background:#d81e06;
      color:#fff;
      font-size:20px;
      font-weight: bold;
  }
  .all-money{
      text-align: center;
      width: 100%;
      line-height:60px;
      background:#ffffff;
      color:#000000;
      font-size:20px;
  }
  .del{
      width:100px;
      height:30px;
      text-align: center;
      line-height:30px;
      color:#d81e06;
      border:1px solid #d81e06;
      border-radius:30px;
      margin-right:20px;
  }
</style>
