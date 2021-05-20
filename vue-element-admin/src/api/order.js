import request from '@/utils/request'
export function fetchOrder(data) {
  return request({
    url: '/order/list',
    method: 'get',
    params: data
  })
}

export function fetchOrderDetaileds(data) {
  return request({
    url: '/order/detaileds',
    method: 'get',
    params: data
  })
}

export function getOrderToken(data) {
  return request({
    url: '/order/ordertoken',
    method: 'get',
    params: data
  })
}

export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export function wxcreateOrder(data) {
  return request({
    url: '/order/wxcreate',
    method: 'post',
    data
  })
}

export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}

export function deleteOrder(data) {
  return request({
    url: '/order/delete',
    method: 'post',
    data
  })
}
