var express = require('express');
var router = express.Router();
const request = require('request')
const {WxuserModel,ScanDataModel,DeviceModel,UserModel,HotelModel,OrderModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', function(req, res, next) {
  const {page,limit,type,token} = req.query
  UserModel.findOne({token:token},function (err, userinfo) {
  	if(userinfo!=null&&userinfo.roles[0]=='admin')
  	{
		HotelModel.find({},function (err, hotels) {
			if (err) return handleError(err);
			res.send({
				result: true,
				data:{list:hotels,total:hotels.length},
				code: 20000
				})
		},{skip: (page-1)*limit,limit:limit})
  	}
  })
});

router.post('/update', function(req, res, next) {
	const {hotel,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			HotelModel.updateOne({_id:hotel._id}, 
			{
			    user_id : hotel.user_id,
			    hotel_name : hotel.hotel_name,
			    tel : hotel.tel,
			    money : hotel.money
			}, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:hotel,
			  	code: 20000
			  })
			});
		}
	})
});

router.post('/create', function(req, res, next) {
	const {hotel,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			console.log(hotel)
			const hoteldata = {
				user_id : hotel.user_id,
				hotel_name : hotel.hotel_name,
				tel : hotel.tel,
				money : hotel.money
			}
			//生成二维码图片
			HotelModel.create([hoteldata],function(err,hotel_new){
				if (err) return handleError(err);
					res.send({
						result: true,
						data:hotel_new[0],
						code: 20000
					})
				})
		}
	})

});

router.post('/delete', function(req, res, next) {
  const {hotel,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			HotelModel.findOneAndDelete({_id:hotel._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:userinfo,
				code: 20000
			})
		}
  	})
});

module.exports = router;
