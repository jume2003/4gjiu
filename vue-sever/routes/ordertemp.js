var express = require('express');
var router = express.Router();
const request = require('request')
const wxlib = require('../model/wxlib')
const {OrderTempModel,DeviceModel,UserModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create', function(req, res, next) {
	const {device_code,openid} = req.query
	console.log(req.query)
	var out_trade_no = "ort_"+new Date().getTime()+Math.floor(Math.random()*1000)+"_"+device_code//新建一个本地order编号
	var code_url = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=scancode,"
	code_url = code_url+ device_code+","+out_trade_no+"#wechat_redirect"
	DeviceModel.findOne({device_code:device_code},function (err, deviceinfo){
		if(deviceinfo!=null)
		{
			//如果是waiter扫码,没有此单,此单过时（创建）
			OrderTempModel.findOne({ortem_index:deviceinfo.ortem_index},function (err, ordteminfo) {
				UserModel.findOne({openid:openid},function (err, userinfo) {
					const sub_time  = ordteminfo==null?0:new Date().getTime()-ordteminfo.uptime
					console.log("sub_time:"+sub_time)
					if(ordteminfo==null||(userinfo!=null&&userinfo.roles[0]=="waiter")||sub_time>120000){
						deviceinfo.ortem_index++
						DeviceModel.updateOne({_id:deviceinfo.id},{ortem_index:deviceinfo.ortem_index},function (err, raw) {
							if (err) return handleError(err)
							var order_tem = {
								ortem_index:deviceinfo.ortem_index,
								out_trade_no:out_trade_no,
								device_id:deviceinfo._id,
								device_code:deviceinfo.device_code,
								device_name:deviceinfo.device_name,
								hotel_id : deviceinfo.hotel_id,
								seller_id : deviceinfo.seller_id,
								waiter_id : '',
								uptime:new Date().getTime(),
								}
							OrderTempModel.create([order_tem],function(err,order_new){
								if (err) return handleError(err)
								res.send({
								ortem_index:deviceinfo.ortem_index,
								data: code_url,
								result: true,
								code: 20000
								});
							})
						})
					}else{
						res.send({
						ortem_index:deviceinfo.ortem_index,
						data: code_url,
						result: true,
						code: 20000
						});
					}
				})
			})
		}else{
			res.send({
			msg:"请重试",
			ortem_index:0,
			data: "none",
			result: false,
			code: 20000
			});
		}
	})
});

router.post('/bindortemindex', function(req, res, next) {
	const {ortem_index,openid} = req.body
	console.log(req.body)
	OrderTempModel.findOne({ortem_index:ortem_index},function (err, ordertemp){
		if (err) return handleError(err)
		if(ordertemp!=null)
		{
			UserModel.findOne({openid:openid},function (err, userinfo) {
				if (err) return handleError(err)
				if(userinfo!=null&&userinfo.roles[0]=='waiter')
				{
					var ordertemp_data = {
					    waiter_id : userinfo._id,
					}
					OrderTempModel.updateOne({ortem_index:ortem_index}, ordertemp_data,function (err, raw) {
						if (err) return handleError(err)
						res.send({
						msg:"绑定成功",
						result: true,
						code: 20000
						});
					})
				}else{
					res.send({
					msg:"无权限",
					result: false,
					code: 20000
					});
				}
			})
		}else{
			res.send({
			msg:"二维码过期",
			result: false,
			code: 20000
			});
		}
	})
});

router.post('/bindcode', function(req, res, next) {
	const {out_trade_no,openid} = req.body
	OrderTempModel.findOne({out_trade_no:out_trade_no},function (err, ordertemp){
		if (err) return handleError(err)
		if(ordertemp!=null)
		{
			UserModel.findOne({openid:openid},function (err, userinfo) {
				if (err) return handleError(err)
				if(userinfo!=null&&userinfo.roles[0]=='waiter')
				{
					var ordertemp_data = {
					    waiter_id : userinfo._id,
					}
					OrderTempModel.updateOne({out_trade_no:out_trade_no}, ordertemp_data,function (err, raw) {
						if (err) return handleError(err)
						res.send({
						msg:"绑定成功",
						result: true,
						code: 20000
						});
					})
				}else{
					res.send({
					msg:"无权限",
					result: false,
					code: 20000
					});
				}
			})
		}else{
			res.send({
			msg:"二维码过期",
			result: false,
			code: 20000
			});
		}
	})
});


module.exports = router;
