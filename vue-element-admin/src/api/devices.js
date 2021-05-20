import request from '@/utils/request'

export function fetchDevices(data) {
  return request({
    url: '/devices/list',
    method: 'get',
    params: data
  })
}

export function createDevices(data) {
  return request({
    url: '/devices/create',
    method: 'post',
    data
  })
}

export function updateDevices(data) {
  return request({
    url: '/devices/update',
    method: 'post',
    data
  })
}

export function deleteDevices(data) {
  return request({
    url: '/devices/delete',
    method: 'post',
    data
  })
}

export function freeTry(data) {
  return request({
    url: '/devices/freetry',
    method: 'post',
    data
  })
}

export function deviceBind(data) {
  return request({
    url: '/devices/devicebind',
    method: 'get',
    params: data
  })
}

export function deviceCmd(data) {
  return request({
    url: '/devices/cmd',
    method: 'get',
    params: data
  })
}

