import request from '@/utils/request'

export function getSms(data) {
  return request({
    url: '/sms/getsms',
    method: 'get',
    params: data
  })
}

export function autSms(data) {
  return request({
    url: '/sms/autsms',
    method: 'get',
    params: data
  })
}
