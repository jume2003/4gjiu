<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <panel-group ref="PanelGroup" @handleSetLineChartData="handleSetLineChartData" />
    <el-row>
      <el-col :span="12">
        <div class="chart-wrapper">
          <pie-chart ref="PieChart" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-wrapper">
          <bar-chart ref="BarChart" />
        </div>
      </el-col>
    </el-row>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData[lineChartDataType]" />
    </el-row>

    <el-row :gutter="8">
      <transaction-table ref="TransactionTable" />
    </el-row>

  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import { getToken } from '@/utils/auth' // get token from cookie
import { getOrderToken } from '@/api/order'
import { weeksDate } from '@/api/remote-search'

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    PieChart,
    BarChart,
    TransactionTable
  },
  data() {
    return {
      lineChartDataType: 'newVisitis',
      lineChartData: {
        newVisitis: {
          expectedData: [0, 0, 0, 0, 0, 0, 0],
          actualData: [0, 0, 0, 0, 0, 0, 0]
        },
        messages: {
          expectedData: [0, 0, 0, 0, 0, 0, 0],
          actualData: [0, 0, 0, 0, 0, 0, 0]
        },
        purchases: {
          expectedData: [0, 0, 0, 0, 0, 0, 0],
          actualData: [0, 0, 0, 0, 0, 0, 0]
        },
        shoppings: {
          expectedData: [0, 0, 0, 0, 0, 0, 0],
          actualData: [0, 0, 0, 0, 0, 0, 0]
        }
      }
    }
  },
  created() {
    this.loopFetch()
    weeksDate({ token: getToken() }).then(response => {
      this.lineChartData = response.data
    })
  },
  methods: {
    loopFetch() {
      this.getOrderToken()
      setTimeout(this.loopFetch, 5000)
    },
    getOrderToken() {
      getOrderToken({ token: getToken() }).then(response => {
        if (this.ordertoken !== response.data.ordertoken) {
          this.ordertoken = response.data.ordertoken
          // 更新数据
          if (this.$refs.TransactionTable != null) { this.$refs.TransactionTable.fetchData() }
          if (this.$refs.PanelGroup != null) { this.$refs.PanelGroup.fetchData() }
          if (this.$refs.PieChart != null) { this.$refs.PieChart.fetchData() }
          if (this.$refs.BarChart != null) { this.$refs.BarChart.fetchData() }
          weeksDate({ token: getToken() }).then(response => {
            this.lineChartData = response.data
          })
        }
      })
    },
    handleSetLineChartData(type) {
      this.lineChartDataType = type
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
