<template>
  <el-table :data="list" border fit highlight-current-row style="width: 100%">
    <el-table-column
      v-loading="loading"
      align="center"
      label="ID"
      width="65"
      element-loading-text="请给我点时间！"
    >
      <template slot-scope="scope">
        <span>{{ scope.row.id }}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="设备二维码">
      <template slot-scope="scope">
        <span>{{ scope.row.device_code}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="设备名字">
      <template slot-scope="scope">
        <span>{{ scope.row.device_name}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="设备纬度">
      <template slot-scope="scope">
        <span>{{ scope.row.device_gps}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="酒店名字">
      <template slot-scope="scope">
        <span>{{ scope.row.hotel_name}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="是否在线">
      <template slot-scope="scope">
        <span>{{ scope.row.is_online}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="试喝次数">
      <template slot-scope="scope">
        <span>{{ scope.row.try_count}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="总次数">
      <template slot-scope="scope">
        <span>{{ scope.row.total_count}}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="剩余次数">
      <template slot-scope="scope">
        <span>{{ scope.row.total_count-scope.row.try_count}}</span>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>
import { fetchDevices } from '@/api/devices'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  props: {
    type: {
      type: String,
      default: 'CN'
    }
  },
  data() {
    return {
      list: null,
      listQuery: {
        page: 1,
        limit: 50,
        type: this.type,
      },
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.$emit('create') // for test
      fetchDevices(this.listQuery).then(response => {
        this.list = response.data.items
        console.log(this.list)
        this.loading = false
      })
    }
  }
}
</script>
