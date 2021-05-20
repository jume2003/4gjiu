var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const {WxuserModel,ScanDataModel,DeviceModel,UserModel}=require('../model/models');

/* GET users listing. */
router.get('/', function(req, res, next) {
  device = {"token":"123","count":0}
  device.token = Math.floor(Math.random()*10000).toString();
  device.count = device.count+1;
  res.send(device);
});

router.get('/heartbeat', function(req, res, next) {
  var devcode = req.query.devcode
  var nettype = req.query.nettype
  var signal = req.query.signal
  var retdata = {"token":"0000","cmd":"none","hbdelay":1000,"count":0,"opdelay":1000}
  DeviceModel.findOne({device_code:devcode},function (err, devicedb) {
	if(devicedb!=null)
	{
		retdata.token = devicedb.token
		retdata.hbdelay = devicedb.hbdelay
		retdata.opdelay = devicedb.opdelay
		retdata.count = devicedb.count
		retdata.cmd = devicedb.cmd
		var myDate=new Date()
		DeviceModel.updateOne({device_code:devcode }, {cmd:"none",nettype:nettype,signal:signal,count:0,heartbeat_time:myDate.getTime()}, function (err, raw) {
		  if (err) return handleError(err);
		  res.send(retdata);
		});
	}else
	{
		console.log("未知设备:"+devcode)
		var myDate=new Date()
		const devicedata = {
			"hotel_id":"",
			"seller_id":"",
		    "device_code" : devcode,
		    "device_name" : "未知设备",
			"heartbeat_time":myDate.getTime(),
		    "is_online" : false,
		    "try_count" : 0,
		    "total_count" : 100,
		    "free_times" : 3,
		    "token" : "888888",
		    "count" : 0,
		    "click" : 0,
		    "image_uri" : "",
			"nettype":"4g",
			"deviceqrcode":"http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=scancode,"+devcode+"#wechat_redirect",
			"devicebindurl":"http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=devicebind,"+devcode+"#wechat_redirect",
			"ortem_index":0
		}
		//生成二维码图片
		DeviceModel.create([devicedata],function(err,device_new){
			if (err) return handleError(err);
			retdata.token = device_new[0].token
			retdata.hbdelay = device_new[0].hbdelay
			retdata.opdelay = device_new[0].opdelay
			retdata.count = device_new[0].count
			res.send(retdata);
		})
	}
  })
});

router.get('/devicecode', function(req, res, next) {
  var click = req.query.click
  retdata = {device_code:"00000000"}
  DeviceModel.findOne({click:click},function (err, devicedb) {
	if(devicedb!=null)
	{
		DeviceModel.updateOne({device_code:devicedb.device_code }, { click:0}, function (err, raw) {
		  if (err) return handleError(err);
		});
		retdata.device_code = devicedb.device_code
		res.send(retdata);
	}else
	{
		console.log("未知绑定值:"+click)
		res.send(retdata);
	}
  })
});

router.get('/cmd', function(req, res, next) {
  const {devcode,cmd,token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
	  if(userinfo!=null&&(userinfo.roles[0]=="admin"||userinfo.roles[0]=="seller"))
	  {
		  DeviceModel.updateOne({device_code:devcode }, { cmd:cmd}, function (err, raw) {
		    if (err) return handleError(err);
			res.send({
				   result: true,
				   code: 20000
				 })
		  });
	  }
  })
});

//绑定销售和酒店到此设备(只能绑定一次)
router.get('/devicebind', function(req, res, next) {
  var {openid,device_code} = req.query
  	UserModel.findOne({openid:openid},function (err, userinfo) {
		DeviceModel.findOne({device_code:device_code},function (err, devicedb) {
			if(devicedb!=null&&userinfo!=null)
			{
				if(userinfo.roles[0]=='seller'&&devicedb.seller_id.length<10)
				{
					DeviceModel.updateOne({device_code:device_code }, {seller_id:userinfo._id}, function (err, raw) {
					  if (err) return handleError(err);
					  res.send({
					  	   result: true,
					  	   msg:"绑定成功",
					  	   code: 20000
					  	 })
					});
				}else if(userinfo.roles[0]=='hotel'&&devicedb.hotel_id.length<10)
				{
					DeviceModel.updateOne({device_code:device_code }, {hotel_id:userinfo._id}, function (err, raw) {
					  if (err) return handleError(err);
					  res.send({
					  	   result: true,
					  	   msg:"绑定成功",
					  	   code: 20000
					  	 })
					});
				}else{
					res.send({
						   result: false,
						   msg:"设备已被其他用户绑定",
						   code: 20000
						 })
				}
			}else{
				res.send({
					   result: false,
					   msg:"绑定失败",
					   code: 20000
					 })
			}
		})
	})
});

router.post('/freetry', function(req, res, next) {
  var wxuser = req.body.wxuser
  var devcode = req.body.devcode
  if(wxuser!=null&&wxuser.openid!=null)
  {
	console.log(wxuser.openid)
	console.log(devcode)
	DeviceModel.findOne({device_code:devcode},function (err, devicedb) {
		if (err) return handleError(err);
		if(devicedb!=null)
		{
			WxuserModel.findOne({openid: wxuser.openid},function (err, wxuserdb) {
				if (err) return handleError(err);
				if(wxuserdb==null)
				{
					WxuserModel.create([wxuser],function(err){if (err) return handleError(err);})
					wxuserdb = wxuser
				}
				if(wxuserdb.tel!=null)
				{
					ScanDataModel.countDocuments({wxuser_id:wxuserdb._id,device_code: devcode}, function (err, count) {
					    if (err) return handleError(err); 
						var date=new Date();
						scandata = {
							hotel_id:devicedb.hotel_id,
							seller_id:devicedb.seller_id,
							wxuser_id:wxuserdb._id,
							date:date.toString(),
							device_code: devcode
							}
						if(devicedb.free_times>count)
						{
							ScanDataModel.create([scandata],function(err){if (err) return handleError(err);})
							devicedb.token = Math.floor(Math.random() * 100000).toString()
							devicedb.count = devicedb.count+1
							devicedb.try_count = devicedb.try_count+1
							DeviceModel.updateOne({device_code:devcode }, { count:devicedb.count,try_count:devicedb.try_count,token:devicedb.token}, function (err, raw) {
							  if (err) return handleError(err);
							});
						}
						var msg = (count <devicedb.free_times)?"申请试喝成功"+(devicedb.free_times-count):"试喝已结束欢迎购买。"
						res.send({
							   result: count <devicedb.free_times,
							   msg:msg,
							   phonesms:false,
							   code: 20000
							 })
						console.log(msg)
					}); 
				}else{
					res.send({
						   result: false,
						   msg:"电话验证",
						   phonesms:true,
						   code: 20000
						 })
				}
			})
		}else{
			res.send({
				   result: true,
				   msg:"设备不在服务器名单",
				   code: 20000
				 })
		}
	})
  }else{
		res.send({
			result: true,
			msg:"请重新扫码!",
			code: 20000
		})
	}

});


router.get('/list', function(req, res, next) {
  const {page,limit,type,token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
  	if(userinfo!=null)
  	{
		const wstr = userinfo.roles[0]=='admin'?{}:{$or:[{hotel_id :userinfo._id},{seller_id :userinfo._id}]}
		DeviceModel.find(wstr,function (err, devices) {
			if (err) return handleError(err);
			var timestamp =(new Date()).getTime()
			for(var i=0;i<devices.length;i++)
			{
				devices[i].is_online=(timestamp-devices[i].heartbeat_time)<(devices[i].hbdelay+10000)
			}
			res.send({
				result: true,
				data:{list:devices,total:devices.length},
				code: 20000
				})
		},{skip: (page-1)*limit,limit:limit})
  	}
  })
});

router.post('/update', function(req, res, next) {
	const {device,token} = req.body
	device.deviceqrcode = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=scancode,"+device.device_code+"#wechat_redirect"
	device.devicebindurl = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=devicebind,"+device.device_code+"#wechat_redirect"
	console.log(device)
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null)
		{
			const wstr = userinfo.roles[0]=='admin'?{_id:device._id}:
			{
				$or:[{hotel_id :userinfo._id},{seller_id :userinfo._id}],
				_id:device._id
			}
			const upstr = userinfo.roles[0]=='admin'?
			{
				hotel_id:device.hotel_id,
				seller_id:device.seller_id,
				device_name:device.device_name,
				device_code:device.device_code,
				device_gps:device.device_gps,
				total_count:device.total_count,
				free_times:device.free_times,
				opdelay:device.opdelay,
				hbdelay:device.hbdelay,
				click:device.click,
				deviceqrcode:device.deviceqrcode,
				devicebindurl:device.devicebindurl,
			}:{
				device_name:device.device_name,
				device_gps:device.device_gps,
				click:device.click
			}
			DeviceModel.updateOne(wstr,upstr, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:device,
			  	code: 20000
			  })
			});
		}
	})
});

router.post('/create', function(req, res, next) {
	const {device,token} = req.body
	device.deviceqrcode = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=scancode,"+device.device_code+"#wechat_redirect"
	device.devicebindurl = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=devicebind,"+device.device_code+"#wechat_redirect"
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null)
		{
			var myDate=new Date()
			const devicedata = {
				"hotel_id":device.hotel_id,
				"seller_id":device.seller_id,
			    "device_code" : device.device_code,
			    "device_name" : device.device_name,
			    "device_gps" : device.device_gps,
				"heartbeat_time":myDate.getTime(),
			    "is_online" : false,
			    "try_count" : 0,
			    "total_count" : device.total_count,
			    "free_times" : device.free_times,
			    "token" : "888888",
			    "opdelay" : device.opdelay,
			    "hbdelay" : device.hbdelay,
			    "count" : 0,
			    "click" : 0,
			    "image_uri" : "",
				"nettype":"",
				"deviceqrcode":device.deviceqrcode,
				"devicebindurl":device.devicebindurl,
				"ortem_index":0
			}
			//生成二维码图片
			DeviceModel.create([devicedata],function(err,device_new){
				if (err) return handleError(err);
				res.send({
					result: true,
					data:device_new[0],
					code: 20000
				})
			})
		}
	})

});

router.post('/delete', function(req, res, next) {
  const {device,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null)
		{
			const wstr = userinfo.roles[0]=='admin'?{_id:device._id}:{hotel_id :userinfo._id,_id:device._id}
			DeviceModel.findOneAndDelete(wstr,function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:device,
				code: 20000
			})
		}
  	})
});


module.exports = router;