import request from '@/utils/request'

export function createOrderTemp(data) {
  return request({
    url: '/ordertemp/create',
    method: 'get',
    params: data
  })
}

export function BindCode(data) {
  return request({
    url: '/ordertemp/bindcode',
    method: 'post',
    data
  })
}

export function BindRotemIndex(data) {
  return request({
    url: '/ordertemp/bindortemindex',
    method: 'post',
    data
  })
}
