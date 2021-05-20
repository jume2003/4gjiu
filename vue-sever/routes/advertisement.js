var express = require('express');
var router = express.Router();
const request = require('request')
const {UserModel,AdvertisementModel}=require('../model/models');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', function(req, res, next) {
  const {page,limit,type,token} = req.query
  AdvertisementModel.find({},null, {sort:{'index': '1'}},function (err, ads) {
  	if (err) return handleError(err);
  	res.send({
  		result: true,
  		data:{list:ads,total:ads.length},
  		code: 20000
  		})
  },{skip: (page-1)*limit,limit:limit})
});

router.post('/update', function(req, res, next) {
	const {ad,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			AdvertisementModel.updateOne({_id:ad._id}, 
			{
			    name : ad.name,
			    url : ad.url,
			    index : ad.index
			}, 
			function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	data:ad,
			  	code: 20000
			  })
			});
		}
	})
});

router.post('/create', function(req, res, next) {
	const {ad,token} = req.body
	UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			console.log(ad)
			const addata = {
				name : ad.name,
				url : ad.url,
				index : ad.index
			}
			AdvertisementModel.create([addata],function(err,ad_new){
				if (err) return handleError(err);
					res.send({
						result: true,
						data:ad_new[0],
						code: 20000
					})
				})
		}
	})

});

router.post('/delete', function(req, res, next) {
  const {ad,token} = req.body
  UserModel.findOne({token:token},function (err, userinfo) {
		if(userinfo!=null&&userinfo.roles[0]=='admin')
		{
			AdvertisementModel.findOneAndDelete({_id:ad._id},function(err){if (err) return handleError(err);})
			res.send({
				result: true,
				data:userinfo,
				code: 20000
			})
		}
  	})
});

module.exports = router;
