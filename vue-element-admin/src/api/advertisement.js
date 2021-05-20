import request from '@/utils/request'

export function fetchAds(data) {
  return request({
    url: '/advertisement/list',
    method: 'get',
    params: data
  })
}

export function createAds(data) {
  return request({
    url: '/advertisement/create',
    method: 'post',
    data
  })
}

export function updateAds(data) {
  return request({
    url: '/advertisement/update',
    method: 'post',
    data
  })
}

export function deleteAds(data) {
  return request({
    url: '/advertisement/delete',
    method: 'post',
    data
  })
}
