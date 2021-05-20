var express = require('express');
var router = express.Router();
const request = require('request')
const wxlib = require('../model/wxlib')
const {handleError,WxuserModel,ScanDataModel,DeviceModel,UserModel,ProfitSharingModel,OrderTempModel,OrderModel,OrderDetailedModel,HotelsByToken,ProductModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/ordertoken', function(req, res, next) {
  const  {token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
  	if (err) return handleError(err);
  	if(userinfo!=null)
  	{
		res.send({
  		result: true,
  		data:{ordertoken:userinfo.ordertoken},
  		code: 20000
  		})
  	}
  })
});

router.get('/list', function(req, res, next) {
	const  {token} = req.query
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			var wstr = userinfo.roles[0]=='admin'?{
			}:{
				$or:[{hotel_id:userinfo._id},{seller_id:userinfo._id},{waiter_id:userinfo._id}]
			};
			OrderModel.find(wstr,null, {sort:'-date'},function (err, orders) {
				if (err) return handleError(err);
				console.log(orders)
				res.send({
						result: true,
						data:{list:orders,total:orders.length},
						code: 20000
						})
			},{skip: 0,limit:20})
		}
	})
});

router.get('/detaileds', function(req, res, next) {
	const  {token,out_trade_no} = req.query
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			OrderDetailedModel.find({out_trade_no:out_trade_no},function (err, detaileds) {
				if (err) return handleError(err);
				console.log(detaileds)
				res.send({
						result: true,
						data:{list:detaileds,total:detaileds.length},
						code: 20000
						})
			},{skip: 0,limit:10})
		}
	})
});

router.post('/update', function(req, res, next) {
	const {order,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null)
		{
			console.log(order)
			var wstr = userinfo.roles[0]=='admin'?{
				order_no : order.order_no,
				tel : order.tel,
				product_id : order.product_id,
				price:order.price,
				count : order.count,
				paystate:order.paystate,
				state:order.state,
			}:{
				state:order.state,
			};
			
			OrderModel.updateOne({_id:order._id}, wstr, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:order,
			  	code: 20000
			  })
			});
		}
	})
});

router.post('/create', function(req, res, next) {
	const {order,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			console.log(order)
			const orderdata = {
				"order_no" : order.order_no,
				"device_id" : order.device_id,
				"device_name" : order.device_name,
				"user_id" : userinfo._id,
				"wxuser_id" : order.wxuser_id,
				"username" : order.username,
				"tel" : order.tel,
				"product_id" : order.product_id,
				"product_name" : order.product_name,
				"product_imgurl" : order.product_imgurl,
				"price" : order.price,
				"count" : order.count,
				"date" :  order.date,
				"paystate" : order.paystate,
				"state" : order.state
			}
			//生成二维码图片
			OrderModel.create([orderdata],function(err,order_new){
				if (err) return handleError(err);
					res.send({
						result: true,
						data:order_new[0],
						code: 20000
					})
				})
		}
	})

});

router.post('/wxpayret', function(req, res, next) {
	const {xml} = req.body
	const order = xml
	console.log(order)
	//签名验证
	if(order!=null)
	{
		//从数据库中查找out_trade_no的订单设为已支付
		console.log(order.out_trade_no[0])
		OrderModel.findOne({out_trade_no:order.out_trade_no[0]},function(err,orderinfo){
			console.log(orderinfo)
			if(orderinfo!=null&&orderinfo.nocestr==order.nonce_str[0]&&
				order.result_code[0]=='SUCCESS'&&order.return_code[0]=='SUCCESS'&&
				order.total_fee[0]==orderinfo.total_price)
			{
				order_data = {
				    total_fee : order.total_fee[0],
				    transaction_id : order.transaction_id[0],
					openid:order.openid[0],
				    paystate : true,
				}
				orderinfo.total_fee = order_data.total_fee
				orderinfo.transaction_id = order_data.transaction_id
				orderinfo.openid = order_data.openid
				if(!orderinfo.paystate){
					//更新ordertoken
					order_data.state="待交货"
					const ordertoken = wxlib.getNonceStr()
					console.log("更新ordertoken:"+ordertoken)
					var orstr = []
					orstr.push({roles:'admin'})
					if(orderinfo.hotel_id.length>10)orstr.push({_id:orderinfo.hotel_id})
					if(orderinfo.seller_id.length>10)orstr.push({_id:orderinfo.seller_id})
					if(orderinfo.waiter_id.length>10)orstr.push({_id:orderinfo.waiter_id})
					UserModel.updateMany({ $or:orstr}, {ordertoken:ordertoken},
					function (err, raw) {if (err) return handleError(err);});
				}
				OrderModel.updateOne({out_trade_no:orderinfo.out_trade_no}, order_data,
				function (err, raw) {
					if (err) return handleError(err);
					//总营收重新计算(三个角色已付款订单相加)
					var whstr = [
						{userid:orderinfo.hotel_id,wstr:{hotel_id:orderinfo.hotel_id,paystate:true},type:0},
						{userid:orderinfo.seller_id,wstr:{seller_id:orderinfo.seller_id,paystate:true},type:1},
						{userid:orderinfo.waiter_id,wstr:{waiter_id:orderinfo.waiter_id,paystate:true},type:2}]
					for(var i in whstr)
					{
						if(whstr[i].userid!=null&&whstr[i].userid.length>10)
						{
							const userid_tem = whstr[i].userid
							const usertype = whstr[i].type
							OrderModel.find(whstr[i].wstr,function(err,orders){
								if (err) return handleError(err);
								var total_money = 0;
								for(var j in orders)
								{
									var order_money = [orders[j].hotel_pay,orders[j].seller_pay,orders[j].waiter_pay]
									total_money = total_money+order_money[usertype]
								}
								UserModel.updateOne({_id:userid_tem}, { money:total_money}, function (err, raw) {
								  if (err) return handleError(err);
								});
							})
						}
					}
					//管理员总营收重新计算
					OrderModel.find({paystate:true},function(err,orders){
						if (err) return handleError(err);
						var total_money = 0;
						for(var j in orders)
						{
							total_money = total_money+orders[j].total_fee
						}
						UserModel.updateMany({roles:'admin'}, { money:total_money}, function (err, raw) {
						  if (err) return handleError(err);
						});
					})
					res.send(wxlib.getWxPayReturnXmlParams({code:'SUCCESS',msg:'OK'}));
					//进行分账操作(三种角色分账)
					const sharingparams = {}
					const pro_wh = []
					const sharing_no = orderinfo.out_trade_no.replace("mc","pa")
					sharingparams[orderinfo.hotel_id.toString()] = {custom_relation:"酒店人员",pay:orderinfo.hotel_pay}
					sharingparams[orderinfo.seller_id.toString()] = {custom_relation:"销售人员",pay:orderinfo.seller_pay}
					sharingparams[orderinfo.waiter_id.toString()] = {custom_relation:"服务人员",pay:orderinfo.waiter_pay}
					if(orderinfo.hotel_id!=null&&orderinfo.hotel_id.length>10)pro_wh.push({_id:orderinfo.hotel_id})
					if(orderinfo.seller_id!=null&&orderinfo.seller_id.length>10)pro_wh.push({_id:orderinfo.seller_id})
					if(orderinfo.waiter_id!=null&&orderinfo.waiter_id.length>10)pro_wh.push({_id:orderinfo.waiter_id})
					UserModel.find({$or:pro_wh},function (err, userinfos) {
						if(userinfos!=null&&userinfos.length!=0)
						{
							const receivers_list = []
							for(let i =0;i<userinfos.length;i++)
							{
								const userinfo = userinfos[i]
								if(userinfo.openid!=null&&userinfo.openid.length>5)
								{
									const shaparams = sharingparams[userinfo._id.toString()]
									receivers_list.push({"type": "PERSONAL_OPENID","account":userinfo.openid,"amount":shaparams.pay,"description": "韶庄推荐奖励"})
								}
							}
							console.log(receivers_list)
							if(receivers_list.length!=0)
							{
								//分账
								setTimeout(() => {
									wxlib.getProfitsharing({
										nonce_str:orderinfo.nocestr,
										out_order_no:sharing_no,
										transaction_id:orderinfo.transaction_id,
										receivers:receivers_list,
										}).then(function(body){
											const {payinfo} = body
											payinfo.receivers = JSON.stringify(receivers_list) 
											console.log(payinfo)
											ProfitSharingModel.create([payinfo],function(err,order_new){if (err) return handleError(err)})
										})
								}, 3* 1000)
							}
						}
					})
				});
			}
		})
	}
});

router.post('/wxcreate', function(req, res, next) {
	const {order} = req.body
	console.log(order)
	var openid = order.openid
	var user_ip = "192.168.1.101"//得到客户IP地址
	var nocestr = wxlib.getNonceStr()
	var out_trade_no = "mc_"+new Date().getTime()+"_"+order.device_code
	WxuserModel.findOne({openid:openid},function (err, userinfo) {
		if(userinfo!=null)
		{
			var pro_wh = []
			for(var i in order.products)
			{
				pro_wh.push({_id:order.products[i].product_id})
			}
			//根据定单信息得到商品价格(用户送过来的订单信息)//计算订单总价格
			ProductModel.find({ $or: pro_wh },function (err, products){
				var total_price = 0;
				var hotel_pay = 0;
				var seller_pay = 0;
				var waiter_pay = 0;
				for(var i in products)
				{
					var detailed_data = {
					"product_id":products[i]._id,
					"name" : products[i].name,
					"imgurl" : products[i].imgurl,
					"price" : products[i].price,
					"out_trade_no":out_trade_no,
					"count":order.products[i].count,
					}
					total_price += parseInt(detailed_data.price*100)*detailed_data.count
					hotel_pay+=parseInt(products[i].hotel_pay*100)*detailed_data.count
					seller_pay+=parseInt(products[i].seller_pay*100)*detailed_data.count
					waiter_pay+=parseInt(products[i].waiter_pay*100)*detailed_data.count
					OrderDetailedModel.create([detailed_data],function(err,order_new){if (err) return handleError(err)})
				}
				total_price = parseInt(total_price)
				hotel_pay = parseInt(hotel_pay)
				seller_pay = parseInt(seller_pay)
				waiter_pay = parseInt(waiter_pay)
				console.log("payinfo:")
				console.log(total_price,hotel_pay,seller_pay,waiter_pay)
				//生成统一订单(out_trade_no,total_fee,total_price,transaction_id,openid,tel,device_id,user_id,date,paystate,state)
				//订单号,已付,应付,微信订单号,付款人openid,电话,属于哪个设备,属于哪个用户
				//查找临时订单
				if(order.type=="code")
				{
					OrderTempModel.findOne({out_trade_no:order.out_trade_no},function (err, ordertemp){
						if(ordertemp!=null)
						{
							var tyorder = {
								nocestr:nocestr,
								out_trade_no:out_trade_no,
								seller_id:ordertemp.seller_id,
								hotel_id:ordertemp.hotel_id,
								waiter_id:ordertemp.waiter_id,
								total_fee:0,
								total_price:total_price,
								transaction_id:"",
								openid:openid,
								tel:order.tel,
								device_id:ordertemp.device_id,
								device_name:ordertemp.device_name,
								username:userinfo.nickname,
								date:new Date(),
								paystate:false,
								state:"待付款",
								hotel_pay:hotel_pay,
								seller_pay:seller_pay,
								waiter_pay:waiter_pay
								}
							OrderModel.create([tyorder],function(err,order_new){
								if (err) return handleError(err)
								wxlib.getPrepayId({
									body:'韶庄酒业',
									openid:openid,
									nonce_str:nocestr,
									out_trade_no:out_trade_no,
									spbill_create_ip:user_ip,
									total_fee:total_price
								}).then(function(body)
								{
									console.log(body)
									res.send({
									data: body,
									result: true,
									code: 20000
									});
								})
							})
						}
					})
				}else if(order.type=="ortemindex")
				{
					DeviceModel.findOne({device_code:order.device_code},function (err, devicedb) {
						if(devicedb!=null)
						{
							OrderTempModel.findOne({ortem_index:devicedb.ortem_index},function (err, ordertemp){
								if(ordertemp!=null)
								{
									var tyorder = {
										nocestr:nocestr,
										out_trade_no:out_trade_no,
										seller_id:ordertemp.seller_id,
										hotel_id:ordertemp.hotel_id,
										waiter_id:ordertemp.waiter_id,
										total_fee:0,
										total_price:total_price,
										transaction_id:"",
										openid:openid,
										tel:order.tel,
										device_id:ordertemp.device_id,
										device_name:ordertemp.device_name,
										username:userinfo.nickname,
										date:new Date(),
										paystate:false,
										state:"待付款",
										hotel_pay:hotel_pay,
										seller_pay:seller_pay,
										waiter_pay:waiter_pay
										}
									OrderModel.create([tyorder],function(err,order_new){
										if (err) return handleError(err)
										wxlib.getPrepayId({
											body:'韶庄酒业',
											openid:openid,
											nonce_str:nocestr,
											out_trade_no:out_trade_no,
											spbill_create_ip:user_ip,
											total_fee:total_price
										}).then(function(body)
										{
											console.log(body)
											res.send({
											data: body,
											result: true,
											code: 20000
											});
										})
									})
								}
							})
						}
					})
				}
			})
		}
  	})

});

router.post('/delete', function(req, res, next) {
  const {order,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			OrderModel.findOneAndDelete({_id:order._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:userinfo,
				code: 20000
			})
		}
  	})
});

module.exports = router;
