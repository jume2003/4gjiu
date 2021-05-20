var express = require('express');
var router = express.Router();
const request = require('request')
const wxlib = require('../model/wxlib')
const SMSClient = require('@alicloud/sms-sdk')
const {WxuserModel,ScanDataModel,DeviceModel,UserModel,HotelModel,OrderModel}=require('../model/models');
const accessKeyId = 'LTAI4FnH4XyDG2Q3pQcVWcRQ'
const secretAccessKey = 'nvYO5x5cvEiN5tgDMegJ5O8Oe1Az1e'
let smsClient = new SMSClient({accessKeyId, secretAccessKey})
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/getsms', function(req, res, next) {
  const {openid,phone_number} = req.query
  WxuserModel.findOne({openid:openid},function (err, wxuser) {
  	if(wxuser!=null)
  	{
		//发送短信查找是否没到5分钟
		const smssceond = Math.floor(Date.now() / 1000)
		var sms_str = (smssceond-wxuser.smssceond)>300?wxlib.getSmsStr():wxuser.smscode
		WxuserModel.updateOne({openid:openid}, {smscode:sms_str,smssceond:smssceond}, function (err, raw) {
		  if (err) return handleError(err);
		  smsClient.sendSMS({
		      PhoneNumbers: phone_number,
		      SignName: '贵州仁怀韶庄',
		      TemplateCode: 'SMS_182680440',
		      TemplateParam: '{"code":"'+sms_str+'"}'
		  }).then(function (ret) {
		      let {Code}=ret
		      if (Code === 'OK') {
		  		res.send({
		  			result: true,
		  			code: 20000,
					msg:"验证码已发送"
		  			});
		      }
		  }, function (err) {
		      //console.log(err)
			  res.send({
			  	result: true,
			  	code: 20000,
				msg:"请稍候再试"
			  	});
		  })
		});
  	}
  })
});

router.get('/autsms', function(req, res, next) {
  const {openid,tel,smscode} = req.query
  WxuserModel.findOne({openid:openid},function (err, wxuser) {
  	if(wxuser!=null)
  	{
		if(tel!=null&&wxuser.smscode!=null&&tel.length==11&&wxuser.smscode.length==4&&wxuser.smscode==smscode)
		{
			WxuserModel.updateOne({openid:openid}, {tel:tel}, function (err, raw) {
			  if (err) return handleError(err);
			  res.send({
			  	result: true,
			  	code: 20000,
			  	autsms:true,
			  	msg:"验证码成功"
			  	});
			});
		}else{
			res.send({
				result: true,
				code: 20000,
				autsms:false,
				msg:"验证码失败"
				});
		}
  	}
  })
});
 

module.exports = router;
