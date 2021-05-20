import request from '@/utils/request'
export function fetchHotel(data) {
  return request({
    url: '/hotel/list',
    method: 'get',
    params: data
  })
}

export function createHotel(data) {
  return request({
    url: '/hotel/create',
    method: 'post',
    data
  })
}

export function updateHotel(data) {
  return request({
    url: '/hotel/update',
    method: 'post',
    data
  })
}

export function deleteHotel(data) {
  return request({
    url: '/hotel/delete',
    method: 'post',
    data
  })
}
