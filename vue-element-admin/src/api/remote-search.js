import request from '@/utils/request'

export function searchUser(name) {
  return request({
    url: '/search/user',
    method: 'get',
    params: { name }
  })
}

export function transactionList(query) {
  return request({
    url: '/transaction/list',
    method: 'get',
    params: query
  })
}

export function orderList(data) {
  return request({
    url: '/order/list',
    method: 'get',
    params: data
  })
}

export function weeksDate(token) {
  return request({
    url: '/user/weeksdate',
    method: 'get',
    params: token
  })
}

export function day24hoursdate(token) {
  return request({
    url: '/user/day24hoursdate',
    method: 'get',
    params: token
  })
}

