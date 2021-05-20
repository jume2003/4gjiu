<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="$t('table.name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-if="roles.includes('admin')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
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
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="250" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.out_trade_no')" width="250" align="center">
        <template slot-scope="{row}">
          <span>{{ row.out_trade_no }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.transaction_id')" width="250" align="center">
        <template slot-scope="{row}">
          <span>{{ row.transaction_id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.devicename')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.device_name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.username')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.tel')" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tel }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.total_fee')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.total_fee/100 }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.total_price')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.total_price/100 }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.paysharing')" align="center">
        <template slot-scope="{row}">
          <span v-if="roles[0]=='admin'">{{ row.total_price/100 }}</span>
          <span v-if="roles[0]=='hotel'">{{ row.hotel_pay/100 }}</span>
          <span v-if="roles[0]=='seller'">{{ row.seller_pay/100 }}</span>
          <span v-if="roles[0]=='waiter'">{{ row.waiter_pay/100 }}</span>
        </template>
      </el-table-column>s

      <el-table-column :label="$t('table.date')" width="250" align="center">
        <template slot-scope="{row}">
          <span>{{ row.date }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.paystate')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.paystate | statusFilter">
            {{ row.paystate | statusPayFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.state')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.state }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleLook(row)">
            {{ $t('table.look') }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
          <el-button type="published" size="mini" @click="handleFinish(row,$index)">
            {{ $t('table.finish') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="订单详细" :visible.sync="dialogLookVisible">
      <el-table :data="products_list" style="width: 100%">
        <el-table-column prop="imgurl" :label="$t('table.product_imgurl')" width="180">
          <template slot-scope="scope" width="90">
            <img style="width:80px;height:80px;border:none;" :src="scope.row.imgurl">
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('table.product_name')" width="180" />
        <el-table-column prop="price" :label="$t('table.price')" />
        <el-table-column prop="count" :label="$t('table.count')" />
      </el-table>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item v-if="roles.includes('admin')" :label="$t('table.devicename')" prop="device_name">
          <el-input v-model="temp.device_name" />
        </el-form-item>

        <el-form-item v-if="roles.includes('admin')" :label="$t('table.username')" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>

        <el-form-item v-if="roles.includes('admin')" :label="$t('table.tel')" prop="tel">
          <el-input v-model="temp.tel" />
        </el-form-item>

        <el-form-item v-if="roles.includes('admin')" :label="$t('table.paystate')" prop="paystate">
          <el-select v-model="temp.paystate" class="filter-item">
            <el-option v-for="item in payOptions" :key="item.key" :label="item.label" :value="item.pay" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('table.state')" prop="state">
          <el-select v-model="temp.state" class="filter-item">
            <el-option v-for="item in stateOptions" :key="item.key" :label="item.label" :value="item.state" />
          </el-select>
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
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth' // get token from cookie
import { fetchPv } from '@/api/article'
import { fetchOrder, createOrder, updateOrder, deleteOrder, fetchOrderDetaileds } from '@/api/order'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
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
    statusPayFilter(status) {
      if (status) { status = 'published' } else { status = 'deleted' }
      const statusMap = {
        published: '已付',
        deleted: '未付'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      products_list: null,
      products_total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 50,
        type: 'ALL',
        token: getToken()
      },
      importanceOptions: [1, 2, 3],
      payOptions: [{ key: 0, label: '已付', pay: true }, { key: 1, label: '未付', pay: false }],
      stateOptions: [{ key: 0, label: '待付款', state: '待付款' }, { key: 1, label: '待交货', state: '待交货' }, { key: 2, label: '已完成', state: '已完成' }],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        'order_no': '',
        'device_id': '',
        'device_name': '',
        'user_id': '',
        'wxuser_id': '',
        'username': '',
        'tel': '',
        'product_id': '',
        'product_name': '',
        'product_imgurl': '',
        'price': 0,
        'count': 0,
        'date': '',
        'paystate': false,
        'state': ''
      },
      dialogFormVisible: false,
      dialogLookVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新建'
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
      fetchOrder(this.listQuery).then(response => {
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
        'order_no': '',
        'device_id': '',
        'device_name': '',
        'user_id': '',
        'wxuser_id': '',
        'username': '',
        'tel': '',
        'product_id': '',
        'product_name': '',
        'product_imgurl': '',
        'price': 0,
        'count': 0,
        'date': '',
        'paystate': false,
        'state': ''
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
          createOrder({ order: this.temp, token: getToken() }).then((response) => {
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
    handleLook(row) {
      var orderinfo = Object.assign({}, row) // copy obj
      fetchOrderDetaileds({ out_trade_no: orderinfo.out_trade_no, token: getToken() }).then((response) => {
        this.products_list = response.data.list
        this.products_total = response.data.total
        console.log(response.data)
      })
      this.dialogLookVisible = true
    },
    handleFinish(row, index) {
      this.list[index].state = this.stateOptions[2].state
      updateOrder({ order: this.list[index], token: getToken() }).then(() => {
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateOrder({ order: tempData, token: getToken() }).then(() => {
            const index = this.list.findIndex(v => v._id === this.temp._id)
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
      deleteOrder({ order: this.list[index], token: getToken() }).then(() => {
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
