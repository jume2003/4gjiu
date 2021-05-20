<template>
  <div>
    <el-table :data="list" style="width: 100%;padding-top: 15px;">
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="250">
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
      </el-table-column>

      <el-table-column :label="$t('table.date')" width="250" align="center">
        <template slot-scope="{row}">
          <span>{{ row.date }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.paystate')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.paystate | statusFilter">
            {{ row.paystate?"已付":"未付" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.state')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.state }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleLook(row)">
            {{ $t('table.look') }}
          </el-button>
          <el-button type="published" size="mini" @click="handleFinish(row,$index)">
            {{ $t('table.finish') }}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { orderList } from '@/api/remote-search'
import { updateOrder, fetchOrderDetaileds } from '@/api/order'
import { getToken } from '@/utils/auth' // get token from cookie

export default {
  filters: {
    statusFilter(status) {
      return status ? 'success' : 'danger'
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      dialogLookVisible: false,
      products_list: null,
      products_total: 0,
      list: null,
      ordertoken: '',
      stateOptions: [{ key: 0, label: '待付款', state: '待付款' }, { key: 1, label: '待交货', state: '待交货' }, { key: 2, label: '已完成', state: '已完成' }]
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  created() {
    console.log(this.roles[0])
    this.fetchData()
  },
  methods: {
    fetchData() {
      orderList({ token: getToken() }).then(response => {
        var is_new_order = false
        this.list = response.data.list.slice(0, 30)
        for (var i = 0; i < this.list.length; i++) {
          if (this.list[i].paystate && this.list[i].state !== '已完成') {
            is_new_order = true
          }
          if (!this.list[i].paystate) {
            this.list.splice(i, 1)
            i--
          }
        }

        if (is_new_order) {
          this.$notify({
            title: '系统消息',
            message: '你有新的定单请及时查看',
            type: 'success',
            duration: 5000
          })
        }
        console.log(this.list)
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
    }
  }
}
</script>
