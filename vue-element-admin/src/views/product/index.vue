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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column :label="$t('table.name')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.imgurl')" min-width="80px">
        <template slot-scope="{row}">
          <el-popover placement="right" title="" trigger="click">
            <img :src="row.imgurl">
            <img slot="reference" :src="row.imgurl" :alt="row.imgurl" style="max-height: 40px;max-width: 40px">
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.hotel_pay')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.hotel_pay }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.seller_pay')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.seller_pay }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.waiter_pay')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.waiter_pay }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.price')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <image-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="200"
      :height="200"
      url="/upload/uploadimg"
      lang-type="en"
      @close="cropClose"
      @crop-upload-success="cropSuccess"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item :label="$t('table.imgurl')" prop="imgurl">
          <el-container>
            <el-input v-model="temp.imgurl" />
            <el-button type="primary" size="mini" @click="handleShowCropper(temp)">上传图像</el-button>
          </el-container>
        </el-form-item>

        <el-form-item :label="$t('table.hotel_pay')" prop="hotel_pay">
          <el-input v-model="temp.hotel_pay" />
        </el-form-item>

        <el-form-item :label="$t('table.seller_pay')" prop="seller_pay">
          <el-input v-model="temp.seller_pay" />
        </el-form-item>

        <el-form-item :label="$t('table.waiter_pay')" prop="waiter_pay">
          <el-input v-model="temp.waiter_pay" />
        </el-form-item>

        <el-form-item :label="$t('table.price')" prop="price">
          <el-input v-model="temp.price" />
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
import ImageCropper from '@/components/ImageCropper'
import { getToken } from '@/utils/auth' // get token from cookie
import { fetchPv } from '@/api/article'
import { fetchProduct, createProduct, updateProduct, deleteProduct } from '@/api/product'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination, ImageCropper },
  directives: { waves },
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
        token: getToken()
      },
      imagecropperShow: false,
      imagecropperKey: 2,
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        'name': '',
        'imgurl': '',
        'price': 0
      },
      dialogFormVisible: false,
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
      fetchProduct(this.listQuery).then(response => {
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
      const { prop, product } = data
      if (prop === 'id') {
        this.sortByID(product)
      }
    },
    sortByID(product) {
      if (product === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        'name': '',
        'imgurl': '',
        'price': 0
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
          createProduct({ product: this.temp, token: getToken() }).then((response) => {
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
    handleShowCropper(row) {
      this.imagecropperShow = true
    },
    cropClose() {
      this.imagecropperShow = false
    },
    cropSuccess(data) {
      console.log(data)
      this.temp.imgurl = data
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          updateProduct({ product: tempData, token: getToken() }).then(() => {
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
      deleteProduct({ product: this.list[index], token: getToken() }).then(() => {
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
