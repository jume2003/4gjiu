<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.device_name" :placeholder="$t('table.devicename')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.deviceid')" prop="id" sortable="custom" align="center" width="250" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.hotel_id')" prop="hotel_id" sortable="custom" align="center" width="250" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.hotel_id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.seller_id')" prop="seller_id" sortable="custom" align="center" width="250" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.seller_id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.devicecode')" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.device_code }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.deviceqrcode')" width="200px" align="center">
        <template v-if="row.deviceqrcode!=null" slot-scope="{row}">
          <el-popover placement="right" title="" trigger="click">
            <vue-qr :text="row.deviceqrcode" :margin="0" logo-src="" :logo-scale="0.3" :size="200" />
            <vue-qr slot="reference" :text="row.deviceqrcode" :margin="0" logo-src="" :logo-scale="0.3" :size="30" />
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.devicebindurl')" width="200px" align="center">
        <template v-if="row.devicebindurl!=null" slot-scope="{row}">
          <el-popover placement="right" title="" trigger="click">
            <vue-qr :text="row.devicebindurl" :margin="0" logo-src="" :logo-scale="0.3" :size="200" />
            <vue-qr slot="reference" :text="row.devicebindurl" :margin="0" logo-src="" :logo-scale="0.3" :size="30" />
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.devicename')" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.device_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.freetimes')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.free_times }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.devicetrycount')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.try_count }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.devicetotalcount')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.total_count }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.devicesycount')" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.total_count-row.try_count }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.devicegps')" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.device_gps }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.opdelay')" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.opdelay }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.hbdelay')" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.hbdelay }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.is_online | statusFilter">
            {{ row.is_online | statusOnlineFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.nettype')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nettype }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.signal')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.signal }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="success" size="mini" @click="handleDrawwater(row)">
            {{ $t('table.drawwater') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item :label="$t('table.devicename')" prop="devicename">
          <el-input v-model="temp.device_name" />
        </el-form-item>

        <el-form-item :label="$t('table.hotel_id')" prop="hotel_id">
          <el-input v-model="temp.hotel_id" />
        </el-form-item>

        <el-form-item :label="$t('table.seller_id')" prop="seller_id">
          <el-input v-model="temp.seller_id" />
        </el-form-item>

        <el-form-item :label="$t('table.devicecode')" prop="devicecode">
          <el-input v-model="temp.device_code" onkeyup="value=value.replace(/[^\d]/g,'')" />
        </el-form-item>

        <el-form-item :label="$t('table.devicetotalcount')" prop="total_count">
          <el-input v-model="temp.total_count" onkeyup="value=value.replace(/[^\d]/g,'')" />
        </el-form-item>

        <el-form-item :label="$t('table.freetimes')" prop="free_times">
          <el-input v-model="temp.free_times" onkeyup="value=value.replace(/[^\d]/g,'')" />
        </el-form-item>

        <el-form-item :label="$t('table.devicegps')" prop="device_gps">
          <el-input v-model="temp.device_gps" />
        </el-form-item>

        <el-form-item :label="$t('table.opdelay')" prop="opdelay">
          <el-input v-model="temp.opdelay" />
        </el-form-item>

        <el-form-item :label="$t('table.hbdelay')" prop="hbdelay">
          <el-input v-model="temp.hbdelay" />
        </el-form-item>

        <el-form-item :label="$t('table.click')" prop="click">
          <el-input v-model="temp.click" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import vueQr from 'vue-qr'
import { getToken } from '@/utils/auth' // get token from cookie
import { fetchPv } from '@/api/article'
import { fetchDevices, createDevices, updateDevices, deleteDevices, deviceCmd } from '@/api/devices'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'ALL', display_name: '全部' },
  { key: 'ONLINE', display_name: '在线' },
  { key: 'OFFLINE', display_name: '离线' },
  { key: 'LESS', display_name: '缺量' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination, vueQr },
  directives: { waves },
  filters: {
    statusFilter(status) {
      if (status) { status = 'published' } else { status = 'deleted' }
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    statusOnlineFilter(status) {
      if (status) { status = 'published' } else { status = 'deleted' }
      const statusMap = {
        published: '在线',
        deleted: '离线'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 50,
        type: 'ALL',
        device_name: null,
        token: getToken()
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        'hotel_id': '',
        'seller_id': '',
        'device_code': '',
        'device_name': '',
        'device_gps': '',
        'deviceqrcode': '',
        'heartbeat_time': '',
        'is_online': false,
        'try_count': 0,
        'total_count': 0,
        'free_times': 0,
        'token': '',
        'opdelay': 0,
        'hbdelay': 0,
        'count': 0,
        'click': 0,
        'image_uri': ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改设备',
        create: '新建设备'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchDevices(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        console.log(response.data)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        'hotel_id': '',
        'seller_id': '',
        'device_code': '',
        'device_name': '',
        'device_gps': '',
        'deviceqrcode': '',
        'heartbeat_time': '',
        'is_online': false,
        'try_count': 0,
        'total_count': 0,
        'free_times': 0,
        'token': '',
        'opdelay': 0,
        'hbdelay': 0,
        'count': 0,
        'click': 0,
        'image_uri': ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createDevices({ device: this.temp, token: getToken() }).then((response) => {
            this.temp._id = response.data._id
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDrawwater(row) {
      console.log(row)
      deviceCmd({ devcode: row.device_code, cmd: 'drawwater', token: getToken() }).then(response => {
        if (response.result) {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDevices({ device: tempData, token: getToken() }).then(() => {
            const index = this.list.findIndex(v => v._id === this.temp._id)
            console.log(this.temp)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteDevices({ device: this.list[index], token: getToken() }).then(() => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
