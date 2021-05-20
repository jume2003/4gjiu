import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getWxUserInfo(data) {
  return request({
    url: '/user/wxuserinfo',
    method: 'get',
    params: data
  })
}

export function getWxJsSdkInfo(url) {
  return request({
    url: '/user/wxjssdkinfo',
    method: 'get',
    params: { url }
  })
}

export function getWxPayInfo(openid) {
  return request({
    url: '/user/wxpayinfo',
    method: 'get',
    params: { openid }
  })
}

export function getStatiStics(data) {
  return request({
    url: '/user/statistics',
    method: 'get',
    params: data
  })
}

export function fetchUsers(data) {
  return request({
    url: '/user/list',
    method: 'get',
    params: data
  })
}

export function createUsers(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function updateUsers(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function deleteUsers(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

export function fetchWxUsers(data) {
  return request({
    url: '/user/wxlist',
    method: 'get',
    params: data
  })
}

export function createWxUsers(data) {
  return request({
    url: '/user/wxcreate',
    method: 'post',
    data
  })
}

export function updateWxUsers(data) {
  return request({
    url: '/user/wxupdate',
    method: 'post',
    data
  })
}

export function deleteWxUsers(data) {
  return request({
    url: '/user/wxdelete',
    method: 'post',
    data
  })
}

export function changePW(data) {
  return request({
    url: '/user/changepw',
    method: 'post',
    data
  })
}

export function getInviteId(data) {
  return request({
    url: '/user/getinviteid',
    method: 'post',
    data
  })
}

export function InviteCreate(data) {
  return request({
    url: '/user/invitecreate',
    method: 'post',
    data
  })
}

export function bindwxCode(data) {
  return request({
    url: '/user/bindwxcode',
    method: 'post',
    data
  })
}

export function getBindwxCodeUrl(data) {
  return request({
    url: '/user/getbindwxcodeurl',
    method: 'post',
    data
  })
}

export function openProfitSharing(data) {
  return request({
    url: '/user/openprofitsharing',
    method: 'post',
    data
  })
}
