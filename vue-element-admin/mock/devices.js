const Mock = require('mockjs')

const List = []
const count = 500

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@integer(1, 3)',
    device_code: +Mock.Random.date('T'),
    device_name: '@first',
    device_gps: '@first',
    hotel_id: '@title(5, 10)',
    hotel_name: '@city',
    is_online: '@boolean(10, 10, true)',
    try_count: '@integer(1, 100)',
    total_count: '@integer(1, 1000)',
    free_times: '@integer(1, 3)',
    token:"123",
    opdelay:'@integer(1000, 30000)',
    hbdelay:'@integer(1000, 30000)',
    count:'@integer(1, 30)',
    image_uri: 'https://image.baidu.com/search/detail?ct=503316480&z=&tn=baiduimagedetail&ipn=d&word=%E4%BA%8C%E7%BB%B4%E7%A0%81&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=-1&hd=&latest=&copyright=&cs=2488581882,381693902&os=2681455076,295185712&simid=3500389892,316204076&pn=1&rn=1&di=192940&ln=1956&fr=&fmq=1615690338930_R&fm=result&ic=&s=undefined&se=&sme=&tab=0&width=&height=&face=undefined&is=0,0&istype=2&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&objurl=https%3A%2F%2Fgimg2.baidu.com%2Fimage_search%2Fsrc%3Dhttp%253A%252F%252Fimg.zcool.cn%252Fcommunity%252F015e0e5b4430b3a80120b959bb077b.jpg%25401280w_1l_2o_100sh.jpg%26refer%3Dhttp%253A%252F%252Fimg.zcool.cn%26app%3D2002%26size%3Df9999%2C10000%26q%3Da80%26n%3D0%26g%3D0n%26fmt%3Djpeg%3Fsec%3D1618282792%26t%3D944503b504a1d8f31c0506e3a86b5539&rpstart=0&rpnum=0&adpicid=0&force=undefined'
  }))
}

module.exports = [
  {
    url: '/vue-element-admin/devices/list',
    type: 'get',
    response: config => {
      const { type, device_name, page, limit } = config.query
      console.log(device_name)
      const mockList = List.filter(item => {
        if (device_name && item.device_name.indexOf(device_name) < 0) return false
        if (type == 'ALL') return true
        if (type == 'ONLINE' && item.is_online) return true
        if (type == 'OFFLINE' && item.is_online == false) return true
        if (type == 'LESS' && item.total_count - item.try_count < 10) return true
        return false
      })
      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList,
          hotels: [{ id: 0, name: '中国' }, { id: 1, name: '美国' }]
        }
      }
    }
  },
  {
    url: '/vue-element-admin/devices/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-element-admin/devices/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }

]
