<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="修改密码" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane label="我的邀请码" name="invitecode">
                <InviteCode :invitecode="invitecode" />
              </el-tab-pane>

              <el-tab-pane label="绑定微信" name="bindwxuser">
                <BindWxUser :bindwxcode="bindwxcode" />
              </el-tab-pane>

            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth' // get token from cookie
import { getInviteId, getBindwxCodeUrl } from '@/api/user'
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Account from './components/Account'
import InviteCode from './components/InviteCode'
import BindWxUser from './components/BindWxUser'

export default {
  name: 'Profile',
  components: { UserCard, Account, InviteCode, BindWxUser },
  data() {
    return {
      user: {},
      invitecode: { icon: '', url: '' },
      bindwxcode: { icon: '', url: '' },
      activeTab: 'activity'
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
    this.getUser()
    this.getInviteCode()
    this.getBindwxCode()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        role: this.roles.join(' | '),
        avatar: this.avatar
      }
    },
    getInviteCode() {
      getInviteId({ token: getToken() }).then((response) => {
        console.log(response)
        const { data } = response
        this.invitecode = {
          url: data,
          icon: ''
        }
      })
    },
    getBindwxCode() {
      getBindwxCodeUrl({ token: getToken() }).then((response) => {
        console.log(response)
        const { data } = response
        this.bindwxcode = {
          url: data,
          icon: ''
        }
      })
    }
  }
}
</script>
