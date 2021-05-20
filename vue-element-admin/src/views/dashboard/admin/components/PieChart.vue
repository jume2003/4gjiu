<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { getStatiStics } from '@/api/user'
import { getToken } from '@/utils/auth' // get token from cookie

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      total_data: { user_count: 0, order_count: 0, money: 0, try_count: 0 }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchData()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    fetchData() {
      getStatiStics({ token: getToken() }).then(response => {
        this.total_data = response.data
        this.initChart()
      })
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['试喝', '付款']
        },
        series: [
          {
            name: 'WEEKLY WRITE ARTICLES',
            type: 'pie',
            roseType: 'radius',
            radius: [0, 100],
            center: ['50%', '38%'],
            data: [
              { value: this.total_data.try_count, name: '试喝' },
              { value: this.total_data.order_count, name: '付款' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 1000
          }
        ]
      })
    }
  }
}
</script>
