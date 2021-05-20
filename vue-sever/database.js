db.device.remove({})
db.hotel.remove({})
db.order.remove({})
db.wxuser.remove({})
db.user.remove({})
db.scandatas.remove({})
db.device.insert({
    "device_code" : "123",
    "device_name" : "456",
    "device_gps" : "789",
    "hotel_id" : "1011",
    "is_online" : true,
    "try_count" : 0.0,
    "total_count":800,
    "free_times" : 1,
    "token":"123",
    "opdelay":15000,
    "hbdelay":1000,
    "count":0,
    "image_uri" : "http:www.baidu.com"
})

db.user.insert({
    "name" : "123",
    "introduction": 'I am a super administrator',
    "avatar": "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    "roles" : ["admin"],
    "username" : "1011",
    "password" : "456",
    "token" : "4555",
    "enabel" : true
})

db.hotel.insert({
    "user_id":"236",
    "hotel_name" : "123",
    "tel" : "456",
    "money" : 1000.0,
})

db.order.insert({
    "order_no" : "123",
    "device_id" : "456",
    "device_name" : "444",
    "user_id" : "789",
    "username" : "8888",
    "tel" : "110",
    "product_id" : "123",
    "product_name" : "888",
    "product_imgurl" : "www.baidu.com",
    "price" : 456.5,
    "count" : 10.0,
    "date" : "555",
    "status" : false
})

db.wxuser.insert({
    "access_token" : "123",
    "openid" : "456",
    "nickname" : "789",
    "sex" : "1",
    "province" : "PROVINCE",
    "city" : "CITY",
    "country" : "COUNTRY",
    "headimgurl" : "123",
    "tel" : "78979"
})

db.scandatas.insert({
    "wxuser_id" : "123",
    "date" : "2021-03-18 12:24:26",
    "device_code" : "789",
    "device_id":"1212"
})

db.getCollection('device').find({})
db.getCollection('user').find({})
db.getCollection('hotel').find({})
db.getCollection('order').find({})
db.getCollection('wxuser').find({})
db.getCollection('scandatas').find({})








