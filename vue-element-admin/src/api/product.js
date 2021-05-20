import request from '@/utils/request'
export function fetchProduct(data) {
  return request({
    url: '/product/list',
    method: 'get',
    params: data
  })
}

export function createProduct(data) {
  return request({
    url: '/product/create',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/product/update',
    method: 'post',
    data
  })
}

export function deleteProduct(data) {
  return request({
    url: '/product/delete',
    method: 'post',
    data
  })
}
