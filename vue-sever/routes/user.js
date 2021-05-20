var express = require('express');
var router = express.Router();
const request = require('request')
const wxlib = require('../model/wxlib')
const {GetWeekDates,MakeWeekDates,MakeDay24Dates,WxuserModel,ScanDataModel,DeviceModel,UserModel,OrderModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/bindwxcode', function(req, res, next) {
	console.log(req.body)
	const password = req.body.password
	const userid = req.body.userid
	const openid = req.body.openid
	console.log(userid,password,openid)
	UserModel.findOne({openid:openid},function (err, ardybinduserinfo) {
		if(ardybinduserinfo==null)
		{
			WxuserModel.findOne({openid:openid},function (err, wxuserinfo) {
				if(wxuserinfo!=null)
				{
					UserModel.findOne({_id:userid,password:password},function (err, userinfo) {
						if (err) return handleError(err);
						if(userinfo!=null)
						{
							UserModel.updateOne({_id:userinfo._id }, {openid:openid,avatar:wxuserinfo.headimgurl}, function (err, raw) {
							  if (err) return handleError(err);
							  wxlib.createProfitsharing({
								  nonce_str:wxlib.getNonceStr(),
								  receiver:{"type": "PERSONAL_OPENID","account":openid,"relation_type":'PARTNER',"custom_relation":userinfo.roles[0]},
								  }).then(function(body){
									const {payinfo} = body
									console.log(payinfo)
									if(payinfo.return_code=='SUCCESS'&&payinfo.result_code=='SUCCESS')
									{
										res.send({
											   result: true,
											   msg:"绑定成功",
											   data:{token:userinfo},
											   code: 20000
											 })
									}else{
										res.send({
											   result: false,
											   msg:"绑定失败",
											   data:{token:userinfo},
											   code: 20000
										})
									}
								  })
							});
						}else{
							res.send({
								   result: false,
								   msg:"账号或密码错误",
								   data:null,
								   code: 20000
								 })
						}
					})
				}else{
					res.send({
						   result: false,
						   msg:"请先扫码酒机绑定",
						   data:null,
						   code: 20000
						 })
				}
			})
		}else{
			res.send({
				   result: false,
				   msg:"此微信不能重复绑定!",
				   data:null,
				   code: 20000
				 })
		}
	})
	
});

router.post('/getbindwxcodeurl', function(req, res, next) {
	const {token} = req.body
	console.log(token)
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			var bindwxurl = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=bindwxcode,"+userinfo._id+"#wechat_redirect"
			res.send({
				   result: true,
				   data:bindwxurl,
				   code: 20000
				 })
		}else{
			res.send({
				   result: false,
				   msg:"账号或密码错误",
				   data:null,
				   code: 20000
				 })
		}
	})
});

router.get('/wxuserinfo/', function(req, res, next) {
  const {code,device_code,state_action} = req.query
  wxlib.getUserToken(code).then(function(body){
	  var token_info = JSON.parse(body); 
	  if(token_info.openid!=null)
	  {
		  DeviceModel.findOne({device_code:device_code},function (err, devicedb) {
			var hotel_id = devicedb!=null?devicedb.hotel_id:""
			var seller_id = devicedb!=null?devicedb.seller_id:""
			WxuserModel.findOne({openid:token_info.openid},function (err, dbuserinfo) {
				wxlib.getUserInfo(token_info).then(function(body){
					var userinfo = JSON.parse(body); 
					userinfo.hotel_id = hotel_id
					userinfo.seller_id = seller_id
					userinfo.token = token_info.access_token
					userinfo.smscode = ""
					userinfo.smssceond = 0
					if(dbuserinfo==null){
						WxuserModel.create([userinfo],function(err){if (err) return handleError(err);})
					}else{
						userinfo.tel = dbuserinfo.tel
						userinfo.smscode = dbuserinfo.smscode
						userinfo.smssceond = dbuserinfo.smssceond
					}
					res.send({
						wxuserinfo: userinfo, 
						msg: "成功", 
						result: true,
						code: 20000
						});
					})
			})
		  })
	  }
  })
});

router.get('/wxjssdkinfo/', function(req, res, next) {
  let noncestr = wxlib.getNonceStr();
  let timestamp = wxlib.getTimestamp();
  let appid = wxlib.AppID
  let appsecret = wxlib.AppSecret
  const url = req.query.url
  console.log(url)
  wxlib.getAccessToken().then(function(token_info){
  	  wxlib.getJsSdkTicket(token_info).then(function(jssdk_tick){
		  var sign = wxlib.getSign(jssdk_tick.ticket, noncestr, timestamp,url)
		  jssdk_tick.noncestr = noncestr
		  jssdk_tick.timestamp = timestamp
		  jssdk_tick.appid = appid
		  jssdk_tick.appsecret = appsecret
		  jssdk_tick.signature = sign.sha1
		  jssdk_tick.sigcode = sign.sort
		  console.log(jssdk_tick)
		  res.send({
			  jssdktick: jssdk_tick,
			  result: true,
			  code: 20000
			  });
	  } )
  })
});

router.get('/wxpayinfo/', function(req, res, next) {
	var openid=req.query.openid
	console.log(openid)
	wxlib.getPrepayId({
		body:'韶庄测试',
		openid:openid,
		out_trade_no:new Date().getTime(),
		spbill_create_ip:"14.23.150.211",
		nocestr:"123",
		total_fee:1
	}).then(function(body)
	{
		console.log(body)
		res.send({
					  data: body,
					  result: true,
					  code: 20000
					  });
	})
});

router.post('/wxpayret/', function(req, res, next) {
	console.log(req.body)
	res.send({
    "code": "SUCCESS",
    "message": "成功"
	});
});

router.post('/login', function(req, res, next) {
	const username = req.body.username
	const password = req.body.password
	console.log(username,password)
	UserModel.findOne({username:username,password:password},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			userinfo.token = Math.floor(10000+Math.random()*90000).toString();
			UserModel.updateOne({_id:userinfo._id }, {token:userinfo.token}, function (err, raw) {
			  if (err) return handleError(err);
			});
			res.send({
				   result: true,
				   data:{token:userinfo.token},
				   code: 20000
				 })
		}else{
			res.send({
				   result: true,
				   msg:"账号或密码错误",
				   data:null,
				   code: 20000
				 })
		}
	})
});

router.post('/logout', function(req, res, next) {
	res.send({
		   result: true,
		   data:null,
		   code: 20000
		 })
});

router.post('/getinviteid', function(req, res, next) {
	const {token} = req.body
	console.log(token)
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			var inviteurl = "http://sh.zssk.net/invite?inviteid="+userinfo._id
			res.send({
				   result: true,
				   data:inviteurl,
				   code: 20000
				 })
		}else{
			res.send({
				   result: false,
				   msg:"账号或密码错误",
				   data:null,
				   code: 20000
				 })
		}
	})
});

router.get('/info', function(req, res, next) {
	var token = req.query.token
	console.log(token)
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			res.send({
				   result: true,
				   data:userinfo,
				   code: 20000
				 })
		}else{
			res.send({
				   result: false,
				   msg:"账号或密码错误",
				   data:null,
				   code: 20000
				 })
		}
	})
});

router.get('/statistics', function(req, res, next) {
	var {token} = req.query
	UserModel.findOne({token:token},function (err, userinfo) {
			if (err) return handleError(err);
			if(userinfo!=null)
			{
				//用户数,总营收,订单数，试喝数
				const wstr = userinfo.roles[0]=='admin'?{}:{$or:[{hotel_id :userinfo._id},{seller_id :userinfo._id}]}
				var whorderstr = userinfo.roles[0]=='admin'?{paystate:true}:{$or:[{hotel_id :userinfo._id},{seller_id :userinfo._id}],paystate:true}
				WxuserModel.countDocuments(wstr, function (err, usercount) {
					var total_money = userinfo.money
					OrderModel.countDocuments(whorderstr, function (err, ordercount) {
							ScanDataModel.countDocuments(wstr, function (err, scancount) {
								res.send({
									result: true,
									data:{ user_count: usercount, order_count: ordercount, money: total_money, try_count: scancount },
									code: 20000
								})
							});
						});
				});
			}else{
				res.send({
					result: false,
					data:null,
					code: 20000
				})
			}
		})
});


router.get('/list', function(req, res, next) {
  const {page,limit,type,token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
  	if(userinfo!=null&&userinfo.roles[0]=='admin')
  	{
		UserModel.find({},function (err, users) {
			if (err) return handleError(err);
			res.send({
				result: true,
				data:{list:users,total:users.length},
				code: 20000
				})
		},{skip: (page-1)*limit,limit:limit})
  	}
  })
});

router.get('/wxlist', function(req, res, next) {
  const {page,limit,type,token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
  	if(userinfo!=null)
  	{
		var whstr = userinfo.roles[0]=='admin'?{}:{$or:[{hotel_id:userinfo._id},{seller_id:userinfo._id}]}
		WxuserModel.find(whstr,function (err, users) {
			if (err) return handleError(err);
			res.send({
				result: true,
				data:{list:users,total:users.length},
				code: 20000
				})
		},{skip: (page-1)*limit,limit:limit})
  	}
  })
});

router.post('/update', function(req, res, next) {
	const {user,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			UserModel.updateOne({_id:user._id}, 
			{
				name:user.name,
				introduction:user.introduction,
				avatar:user.avatar,
				roles:user.roles,
				username:user.username,
				password:user.password,
				enabel:user.enabel,
				openid:user.openid,
				ordertoken:wxlib.getNonceStr(),
			}, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:userinfo,
			  	code: 20000
			  })
			});
		}
	})
});

//邀请注册
router.post('/invitecreate', function(req, res, next) {
	var {inviteid,username,password,name} = req.body
	username = wxlib.filtraTionn(username)
	password = wxlib.filtraTionn(password)
	name = wxlib.filtraTionn(name)
	console.log(username)
	UserModel.findOne({_id:inviteid},function (err, userinfo) {
		if(userinfo!=null)
		{
			UserModel.findOne({username:username},function (err, myuserinfo) {
				if(myuserinfo==null)
				{
					var roles = ["hotel"]
					if(userinfo.roles[0]=='admin')roles = ["seller"]
					else if(userinfo.roles[0]=='seller')roles = ["hotel"]
					else if(userinfo.roles[0]=='hotel')roles = ["waiter"]
					const userdata = {
						"name" : name,
						"introduction" : "韶庄酒业",
						"avatar" : "http://sh.zssk.net/upload/imgs/logo.jpg",
						"roles" : roles,
						"username" : username,
						"password" : password,
						"token" : "8888",
						"ordertoken":"6666",
						"enabel" : userinfo.enabel,
						"money":0,
						"openid":"",
						"inviteid":userinfo._id
					}
					UserModel.create([userdata],function(err,userdata_new){
						if (err) return handleError(err);
						var bindwxurl = "http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx679688f5b39e179e&redirect_uri=http://sh.zssk.net/wxlogin&response_type=code&scope=snsapi_userinfo&state=bindwxcode,"+userdata_new[0]._id+"#wechat_redirect"
							res.send({
								result: true,
								msg:"注册成功!",
								url:bindwxurl,
								code: 20000
							})
						})
				}else{
					res.send({
						result: false,
						msg:"账号已存在!",
						data:{},
						code: 20000
					})
				}
			})
		}else{
			res.send({
				result: false,
				msg:"邀请码无效，请重试",
				data:{},
				code: 20000
			})
		}
	})

});

router.post('/create', function(req, res, next) {
	const {user,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			UserModel.findOne({username:user.username},function (err, myuserinfo) {
				if(myuserinfo==null)
				{
					console.log(user)
					const userdata = {
						"name" : user.name,
						"introduction" : "I am a super administrator",
						"avatar" : user.avatar,
						"roles" : user.roles,
						"username" : user.username,
						"password" : user.password,
						"token" : "8888",
						"ordertoken":"6666",
						"enabel" : user.enabel,
						"money":0,
						"openid":"",
						"inviteid":""
					}
					//生成二维码图片
					UserModel.create([userdata],function(err,userdata_new){
						if (err) return handleError(err);
							res.send({
								result: true,
								data:userdata_new[0],
								code: 20000
							})
						})
				}else{
					res.send({
						result: false,
						msg:"账号已存在",
						data:{},
						code: 20000
					})
				}
			})
		}
	})
});

router.post('/delete', function(req, res, next) {
  const {user,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			UserModel.findOneAndDelete({_id:user._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:userinfo,
				code: 20000
			})
		}
  	})
});

router.post('/wxdelete', function(req, res, next) {
  const {user,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			WxuserModel.findOneAndDelete({_id:user._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:userinfo,
				code: 20000
			})
		}
  	})
});

//开通收款
router.post('/openprofitsharing', function(req, res, next) {
  const {user,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			UserModel.findOne({_id:user._id},function (err, opuserinfo) {
				if(opuserinfo!=null&&opuserinfo.openid!=null)
				{
					wxlib.createProfitsharing({nonce_str:wxlib.getNonceStr(),
					receiver:{"type": "PERSONAL_OPENID","account":opuserinfo.openid,"relation_type":'PARTNER',"custom_relation":opuserinfo.roles[0]},
					}).then(function(body){
						const {payinfo} = body
						console.log(payinfo)
						if(payinfo.return_code=='SUCCESS'&&payinfo.result_code=='SUCCESS')
						{
							res.send({
								result: true,
								msg:"已开通",
								data:userinfo,
								code: 20000
							})
						}else{
							res.send({
								result: false,
								msg:payinfo.err_code_des==null?payinfo.return_msg:payinfo.err_code_des,
								data:userinfo,
								code: 20000
							})
						}
					})
				}else{
					res.send({
						result: false,
						msg:"未绑定微信",
						data:userinfo,
						code: 20000
					})
				}
			})
		}
  	})
});


router.post('/changepw', function(req, res, next) {
  const {oldpw,newpw,token} = req.body
  console.log(req.body)
  UserModel.findOne({token:token},function (err, userinfo) {
		if(newpw!=null&&newpw.length>=6&&userinfo!=null&&userinfo.password==oldpw)
		{
			UserModel.updateOne({_id:userinfo._id},
			{
				password:newpw,
			}, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
				msg:"修改成功",
			  	data:"",
			  	code: 20000
			  })
			});
		}else{
			res.send({
				result: false,
				msg:"密码错误.",
				data:"",
				code: 20000
			})
		}
  	})
});
//24小时内每一个小时的盈利
router.get('/day24hoursdate', function(req, res, next) {
  const {token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null)
		{
			var whstr = userinfo.roles[0]=='admin'?{}:{user_id:userinfo._id.toString()}
			var today_str = new Date().toISOString().substring(0,10)
			console.log(new Date().toISOString())
			OrderModel.aggregate([
				{  
					$match: {created:{
						"$gte": new Date(today_str+'T00:00:00.779Z'),
						"$lte":new Date(today_str+'T23:00:00.779Z')
						}}  
				},
				{
					$match: whstr
				},
				{
					$project :{
						new_time_stamp :{$substr :["$created",11,2]},
						total_fee :"$total_fee",
					}  
				},
				{
					$group:{_id:'$new_time_stamp',total_fee : {$sum : "$total_fee"}},
				}
				,
				{
					$sort: {"_id": 1}
				}
				],function (err, orders){
				var ret_datas = MakeDay24Dates(orders)
				res.send({
					   result: true,
					   data:ret_datas,
					   code: 20000
					 })
			})
			
		}
  	})
});
//本周与上周
router.get('/weeksdate', function(req, res, next) {
  const {token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
		{
			if(userinfo!=null)
			{
				var cur_date = new Date()
				var last_data = new Date(new Date().setDate(-7))
				var whstr = userinfo.roles[0]=='admin'?{}:{user_id:userinfo._id.toString()}
				var wxuser_ex = GetWeekDates(cur_date,WxuserModel,null,whstr)
				var scand_ex = GetWeekDates(cur_date,ScanDataModel,null,whstr)
				var order_ex = GetWeekDates(cur_date,OrderModel,"total_fee",whstr)
				var wxuser_l_ex = GetWeekDates(last_data,WxuserModel,null,whstr)
				var scand_l_ex = GetWeekDates(last_data,ScanDataModel,null,whstr)
				var order_l_ex = GetWeekDates(last_data,OrderModel,"total_fee",whstr)
				var ret_datas =   {
					newVisitis: {
					    expectedData:null,
					    actualData:null
					  },
					  messages: {
					    expectedData: null,
					    actualData: null
					  },
					  purchases: {
					    expectedData: null,
					    actualData: null
					  },
					  shoppings: {
					    expectedData: null,
					    actualData:null
					  }
					}
				wxuser_ex.exec(function (err, wxusers) {
					scand_ex.exec(function (err, scand) {
						order_ex.exec(function (err, orders) {
							wxuser_l_ex.exec(function (err, wxusers_l) {
								scand_l_ex.exec(function (err, scand_l) {
									order_l_ex.exec(function (err, orders_l) {
										ret_datas.newVisitis.actualData = MakeWeekDates(wxusers,true)
										ret_datas.newVisitis.expectedData = MakeWeekDates(wxusers_l,true)
										ret_datas.messages.actualData = MakeWeekDates(orders,true)
										ret_datas.messages.expectedData = MakeWeekDates(orders_l,true)
										ret_datas.purchases.actualData = MakeWeekDates(orders,false)
										ret_datas.purchases.expectedData = MakeWeekDates(orders_l,false)
										ret_datas.shoppings.actualData = MakeWeekDates(scand,true)
										ret_datas.shoppings.expectedData = MakeWeekDates(scand_l,true)
										res.send({
											result: true,
											data:ret_datas,
											code: 20000
											})
									})
								})
							})
						})
					})
				})
			}
		}
  	})
});

module.exports = router;
