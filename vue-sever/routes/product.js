var express = require('express');
var router = express.Router();
const request = require('request')
const {WxuserModel,ScanDataModel,DeviceModel,UserModel,ProductModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', function(req, res, next) {
	ProductModel.find({},function (err, products) {
		if (err) return handleError(err);
		console.log(products)
		res.send({
			result: true,
			data:{list:products,total:products.length},
			code: 20000
			})
		},{skip: 0,limit:20})
});

router.post('/update', function(req, res, next) {
	const {product,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			console.log(product)
			var wstr = {
				name : product.name,
				imgurl : product.imgurl,
				hotel_pay:product.hotel_pay,
				seller_pay:product.seller_pay,
				waiter_pay:product.waiter_pay,
				price : product.price,
			}
			ProductModel.updateOne({_id:product._id}, wstr, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:product,
			  	code: 20000
			  })
			});
		}
	})
});

router.post('/create', function(req, res, next) {
	const {product,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			console.log(product)
			const productdata = {
				name : product.name,
				imgurl : product.imgurl,
				hotel_pay:product.hotel_pay,
				seller_pay:product.seller_pay,
				waiter_pay:product.waiter_pay,
				price : product.price,
			}
			//生成二维码图片
			ProductModel.create([productdata],function(err,product_new){
				if (err) return handleError(err);
					res.send({
						result: true,
						data:product_new[0],
						code: 20000
					})
				})
		}
	})

});

router.post('/delete', function(req, res, next) {
  const {product,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			ProductModel.findOneAndDelete({_id:product._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:product,
				code: 20000
			})
		}
  	})
});

module.exports = router;
