<template>
  <el-form>
    <el-form-item label="旧密码">
      <el-input v-model.trim="user.oldpassword" />
    </el-form-item>
    <el-form-item label="新密码">
      <el-input v-model.trim="user.password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">确定</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { changePW } from '@/api/user'
import { getToken } from '@/utils/auth'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          oldpassword: '',
          password: ''
        }
      }
    }
  },
  methods: {
    submit() {
      changePW({ oldpw: this.user.oldpassword, newpw: this.user.password, token: getToken() }).then((response) => {
        if (response.result) {
          this.user.oldpassword = ''
          this.user.password = ''
        }
        this.$message({
          message: response.msg,
          type: 'success',
          duration: 5 * 1000
        })
      })
    }
  }
}
</script>
