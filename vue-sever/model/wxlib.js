var express = require('express');
const request = require('request')
const qs = require('querystring');
var sha1 = require('sha1');
var crypto = require('crypto');
var xml2js = require('xml2js');
var fs = require('fs');
var router = express.Router();
const AppID = "wx679688f5b39e179e"
const AppSecret = "dbb1e2ce968cd21ae7130a3bb10f90fd"
//const AppID = "wx803f22bf744751a1"
//const AppSecret = "597b44e5918a0c76bb03c682e9a40062"
const MchID = "1607671006"
const ApiKey = "597b44e5918a0c76bb03c682e9a4zssk"
const NotifyUrl= "http://sh.zssk.net:8081/order/wxpayret"

const UserTokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?'
const AccessTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?'

const UserInfoUrl = 'https://api.weixin.qq.com/sns/userinfo?'
const JsSdkUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?'
//全局jssdk token
global.access_token_info = {timestamp:0};
global.jssdk_tick = {timestamp:0};

function getSmsStr () {
  var text = "";
  var possible = "0123456789";
  for(var i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getNonceStr () {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
//timestamp
function getTimestamp() {
  return new Date().valueOf();
}

function getSign(jsApiTicket, noncestr, timestamp, url) {
  let data = {
    'jsapi_ticket': jsApiTicket,
    'noncestr': noncestr,
    'timestamp': timestamp,
    'url': url
  };
  var sortData = "jsapi_ticket=" + jsApiTicket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;
  return {sha1:sha1(sortData),sort:sortData}
}

function getUserToken(code) {
  let reqUrl = UserTokenUrl
  let params = {
    appid: AppID,
    secret: AppSecret,
    code: code,
    grant_type: 'authorization_code'
  };
  let options = {
    method: 'get',
    url: reqUrl+qs.stringify(params)
  };
  return new Promise((resolve, reject) => {
    request(options, function (err, res, body) {
      if (res) {
        resolve(body);
      } else {
        reject(err);
      }
    })
  })
}

function getAccessToken() {
  let reqUrl = AccessTokenUrl
  let params = {
    appid: AppID,
    secret: AppSecret,
    grant_type: 'client_credential'
  };
  let options = {
    method: 'get',
    url: reqUrl+qs.stringify(params)
  };
  return new Promise((resolve, reject) => {
	let pass_time = getTimestamp()-global.access_token_info.timestamp
	console.log("token pass_time",pass_time)
	if(pass_time<global.access_token_info.expires_in*1000-5000)
	{
		resolve(global.access_token_info);
	}else
	{
		request(options, function (err, res, body) {
		  if (res) {
			global.access_token_info = JSON.parse(body);
			global.access_token_info.timestamp = getTimestamp()
		    resolve(global.access_token_info);
		  } else {
		    reject(err);
		  }
		})
	}
  })
}

function getUserInfo(token_info) {
  let reqUrl = UserInfoUrl
  let params = {
    access_token: token_info.access_token,
    openid: token_info.openid,
    lang: 'zh_CN'
  };
  let options = {
    method: 'get',
    url: reqUrl+qs.stringify(params)
  };
  return new Promise((resolve, reject) => {
    request(options, function (err, res, body) {
      if (res) {
        resolve(body);
      } else {
        reject(err);
      }
    })
  })
}

function getJsSdkTicket(token_info) {
  let reqUrl = JsSdkUrl
  let params = {
    access_token: token_info.access_token,
    type: 'jsapi'
  };
  let options = {
    method: 'get',
    url: reqUrl+qs.stringify(params)
  };
  return new Promise((resolve, reject) => {
	  let pass_time = getTimestamp()-global.jssdk_tick.timestamp
	  if(pass_time<global.jssdk_tick.expires_in*1000-5000)
	  {
	  	resolve(global.jssdk_tick);
	  }else
	  {
	  	request(options, function (err, res, body) {
	  	  if (res) {
	  		global.jssdk_tick = JSON.parse(body);
	  		global.jssdk_tick.timestamp = getTimestamp()
	  	    resolve(global.jssdk_tick);
	  	  } else {
	  	    reject(err);
	  	  }
	  	})
	  }
  })
}

function getUnifiedorderXmlParams(obj){
    var body = 
	'<xml> ' +
    '<appid>'+AppID+'</appid> ' +
    '<body>'+obj.body+'</body> ' +
    '<mch_id>'+MchID+'</mch_id> ' +
    '<nonce_str>'+obj.nonce_str+'</nonce_str> ' +
    '<notify_url>'+obj.notify_url+'</notify_url>' +
    '<openid>'+obj.openid+'</openid> ' +
    '<out_trade_no>'+obj.out_trade_no+'</out_trade_no>'+
	'<profit_sharing>'+obj.profit_sharing+'</profit_sharing>'+
	'<sign>'+obj.sign+'</sign> ' +
    '<spbill_create_ip>'+obj.spbill_create_ip+'</spbill_create_ip> ' +
    '<total_fee>'+obj.total_fee+'</total_fee> ' +
    '<trade_type>'+obj.trade_type+'</trade_type> ' +
    '</xml>';
    return body;
}

function getProfitsharingXmlParams(obj){
	var receivers = JSON.stringify(obj.receivers)
    var body = 
	'<xml> ' +
    '<appid>'+AppID+'</appid> ' +
    '<mch_id>'+MchID+'</mch_id> ' +
    '<nonce_str>'+obj.nonce_str+'</nonce_str> ' +
    '<out_order_no>'+obj.out_order_no+'</out_order_no>'+
	'<sign>'+obj.sign+'</sign> ' +
    '<sign_type>'+obj.sign_type+'</sign_type> ' +
    '<transaction_id>'+obj.transaction_id+'</transaction_id> ' +
    '<receivers>'+receivers+'</receivers> ' +
    '</xml>';
    return body;
}

function getCreateProfitsharingXmlParams(obj){
	var receiver = JSON.stringify(obj.receiver)
    var body = 
	'<xml> ' +
    '<appid>'+AppID+'</appid> ' +
    '<mch_id>'+MchID+'</mch_id> ' +
    '<nonce_str>'+obj.nonce_str+'</nonce_str> ' +
	'<sign>'+obj.sign+'</sign> ' +
    '<sign_type>'+obj.sign_type+'</sign_type> ' +
    '<receiver>'+receiver+'</receiver> ' +
    '</xml>';
    return body;
}

function getProfitsharingFinishXmlParams(obj){
    var body = 
	'<xml> ' +
    '<appid>'+AppID+'</appid> ' +
    '<mch_id>'+MchID+'</mch_id> ' +
    '<nonce_str>'+obj.nonce_str+'</nonce_str> ' +
	'<out_order_no>'+obj.out_order_no+'</out_order_no> ' +
	'<transaction_id>'+obj.transaction_id+'</transaction_id> ' +
	'<sign>'+obj.sign+'</sign> ' +
    '<sign_type>'+obj.sign_type+'</sign_type> ' +
	'<description>'+obj.description+'</description> ' +
    '</xml>';
    return body;
}

function getWxPayReturnXmlParams(obj){
    var body = 
	'<xml> ' +
    '<return_code>'+obj.code+'</return_code> ' +
    '<return_msg>'+obj.msg+'</return_msg> ' +
    '</xml>';
    return body;
}

function MD5(str)
{
	var crypto = require('crypto');  //加载加密文件
	var md5 = crypto.createHash('md5');  
	md5.update(str);  
	str = md5.digest('hex'); 
	return str;
}

function getWxPaySign(signParams){
	// 生成签名
	var keys = Object.keys(signParams);
	keys = keys.sort();
	var newArgs = {};
	keys.forEach(function (val, key) {
	    if (signParams[val]){
	        newArgs[val] = signParams[val];
			newArgs[val] = newArgs[val].toString().replace(/:/g,";")
	    }
	})
	var stringA = JSON.stringify(newArgs)
	stringA = stringA.replace(/}/g,"").replace(/{/g,"").replace(/:/g,"=").replace(/"/g,"")
	.replace(/,/g,"&").replace(/;/g,":")
	console.log(stringA)
	var stringSignTemp=stringA+"&key="+ApiKey
	console.log(stringSignTemp)
	var sign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest("hex").toUpperCase();
	return sign
}


function getWxPaySignSHA256(signParams){
	// 生成签名
	var keys = Object.keys(signParams);
	keys = keys.sort();
	var newArgs = {};
	keys.forEach(function (val, key) {
	    if (signParams[val]){
	        newArgs[val] = signParams[val];
			newArgs[val] = newArgs[val].toString().replace(/:/g,";")
	    }
	})
	var stringA = JSON.stringify(newArgs)
	stringA = stringA.replace(/}/g,"").replace(/{/g,"").replace(/:/g,"=").replace(/"/g,"")
	.replace(/,/g,"&").replace(/;/g,":")
	stringA = stringA.replace(/\)/g,"}").replace(/\(/g,"{").replace(/\*/g,"\"").replace(/`/g,",")
	//console.log(stringA)
	var stringSignTemp=stringA+"&key="+ApiKey
	//console.log(stringSignTemp)
	var sign = crypto.createHmac('SHA256', ApiKey).update(stringSignTemp, 'utf8').digest("hex").toUpperCase();
	return sign
}
//完结分账
function profitsharingFinish(obj){
	var ProfitsharingParams = {
	    appid : AppID,
	    mch_id : MchID,
	    nonce_str: obj.nonce_str,
		transaction_id:obj.transaction_id,
		out_order_no:obj.out_order_no,
		description:obj.description,
		sign :'',
	    sign_type : 'HMAC-SHA256'
	}
	return new Promise(function (resolve, reject) {
		ProfitsharingParams.sign = getWxPaySignSHA256(ProfitsharingParams);
		console.log(ProfitsharingParams)
		var url = 'https://api.mch.weixin.qq.com/secapi/pay/profitsharingfinish';
		var xmlps = JSON.stringify(getProfitsharingFinishXmlParams(ProfitsharingParams))
		console.log(xmlps)
		request({
		url:url,
		agentOptions: {
			cert: fs.readFileSync('key/apiclient_cert.pem', 'utf-8'),
			key:fs.readFileSync('key/apiclient_key.pem' )
		},
		headers: { //设置请求头
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'User-Agent': 'mrt'
		},
		method: 'POST',
		body:xmlps
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			// 微信返回的数据为 xml 格式， 需要装换为 json 数据， 便于使用
				xml2js.parseString(body,  {explicitArray : false}, function(err, json) {
					var payinfo = json.xml
					//console.log(payinfo)
					resolve({payinfo:payinfo});
				});
			} else {
			    reject(body);
			}
		})
	})
}

//创建分账接收方
function createProfitsharing(obj){
	var receiver = JSON.stringify(obj.receiver)
	console.log(receiver)
	var ProfitsharingParams = {
	    appid : AppID,
	    mch_id : MchID,
	    nonce_str: obj.nonce_str,
		receiver:receiver,
		sign :'',
	    sign_type : 'HMAC-SHA256'
	}
	return new Promise(function (resolve, reject) {
		ProfitsharingParams.receiver = ProfitsharingParams.receiver.replace(/}/g,")").replace(/{/g,"(").replace(/"/g,"*").replace(/,/g,"`")
		ProfitsharingParams.sign = getWxPaySignSHA256(ProfitsharingParams);
		ProfitsharingParams.receiver = JSON.stringify(obj.receiver)
		//console.log(ProfitsharingParams)
		var url = 'https://api.mch.weixin.qq.com/pay/profitsharingaddreceiver';
		var xmlps = JSON.stringify(getCreateProfitsharingXmlParams(ProfitsharingParams))
		xmlps = xmlps.replace(/\\/g,"")
		xmlps = xmlps.replace("\"{","{")
		xmlps = xmlps.replace("}\"","}")
		//console.log(xmlps)
		request({
		url:url,
		headers: { //设置请求头
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'User-Agent': 'mrt'
		},
		method: 'POST',
		body:xmlps
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			// 微信返回的数据为 xml 格式， 需要装换为 json 数据， 便于使用
				xml2js.parseString(body,  {explicitArray : false}, function(err, json) {
					var payinfo = json.xml
					//console.log(payinfo)
					resolve({payinfo:payinfo});
				});
			} else {
			    reject(body);
			}
		})
	})
}
//分账
function getProfitsharing(obj){
    var that = this;
    // 生成分账接口参数
	var receivers = JSON.stringify(obj.receivers)
	console.log(receivers)
    var ProfitsharingParams = {
        appid : AppID,
        mch_id : MchID,
        nonce_str: obj.nonce_str,
		transaction_id:obj.transaction_id,//微信订单号
        out_order_no : obj.out_order_no,//分账号
		receivers:receivers,
		sign :'',
        sign_type : 'HMAC-SHA256',
    }
	return new Promise(function (resolve, reject) {
		ProfitsharingParams.receivers = ProfitsharingParams.receivers.replace(/}/g,")").replace(/{/g,"(").replace(/"/g,"*").replace(/,/g,"`")
		ProfitsharingParams.sign = getWxPaySignSHA256(ProfitsharingParams);
		ProfitsharingParams.receivers = JSON.stringify(obj.receivers)
		//console.log(ProfitsharingParams)
		var url = 'https://api.mch.weixin.qq.com/secapi/pay/profitsharing';
		var xmlps = JSON.stringify(getProfitsharingXmlParams(ProfitsharingParams))
		xmlps = xmlps.replace(/\\/g,"")
		xmlps = xmlps.replace("\"[","[")
		xmlps = xmlps.replace("]\"","]")
		//console.log(xmlps)
		request({
		url:url,
		agentOptions: {
			cert: fs.readFileSync('key/apiclient_cert.pem', 'utf-8'),
			key:fs.readFileSync('key/apiclient_key.pem' )
		},
		headers: { //设置请求头
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'User-Agent': 'mrt'
		},
		method: 'POST',
		body:xmlps
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			// 微信返回的数据为 xml 格式， 需要装换为 json 数据， 便于使用
				xml2js.parseString(body,  {explicitArray : false}, function(err, json) {
					var payinfo = json.xml
					//console.log(payinfo)
					resolve({payinfo:payinfo});
				});
			} else {
			    reject(body);
			}
		})
	})
}
//统一接口
function getPrepayId(obj){
    var that = this;
    // 生成统一下单接口参数
    var UnifiedorderParams = {
        appid : AppID,
        body : obj.body,
        mch_id : MchID,
        nonce_str: obj.nonce_str,
        notify_url : NotifyUrl,// 微信付款后的回调地址
        openid : obj.openid,  //改
        out_trade_no : obj.out_trade_no,//new Date().getTime(), //订单号
		profit_sharing:'Y',
		sign :'',
        spbill_create_ip : obj.spbill_create_ip,
        total_fee : obj.total_fee,
        trade_type : 'JSAPI',
    }
	return new Promise(function (resolve, reject) {
		UnifiedorderParams.sign = getWxPaySign(UnifiedorderParams);
		//console.log(UnifiedorderParams)
		var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
		var xmlps = JSON.stringify(getUnifiedorderXmlParams(UnifiedorderParams))
		//console.log(xmlps)
		request.post({url : url, body:xmlps}, function (error, response, body) {
			var prepay_id = '';
			if (!error && response.statusCode == 200) {
			// 微信返回的数据为 xml 格式， 需要装换为 json 数据， 便于使用
				xml2js.parseString(body,  {explicitArray : false}, function(err, json) {
					var payinfo = json.xml
					var jsbinfo = {
						"appId":payinfo.appid,
						"timeStamp":getTimestamp(),
						"nonceStr":obj.nonce_str,
						"package":"prepay_id="+payinfo.prepay_id,     
						"signType":"MD5",//微信签名方式：     
						"paySign":""//微信签名 
					}
					jsbinfo.paySign = getWxPaySign(jsbinfo)
					resolve({payinfo:payinfo,jsbinfo:jsbinfo});
				});
			} else {
			    reject(body);
			}
		});
	})
}

function getBrandWCPayParams( obj, callback ){
        var that = this;
        var prepay_id_promise = that.getPrepayId(obj);
        prepay_id_promise.then(function (prepay_id) {
            var prepay_id = prepay_id;
            var wcPayParams = {
                "appId" : APPID,     //公众号名称，由商户传入
                "timeStamp" : parseInt(new Date().getTime() / 1000).toString(),         //时间戳，自1970年以来的秒数
                "nonceStr" : that.createNonceStr(), //随机串
                "package" : "prepay_id="+prepay_id,
                "signType" : "MD5",         //微信签名方式：
            };
            wcPayParams.paySign = that.getSign(wcPayParams); //微信支付签名
            callback(null, wcPayParams);
        },function (error) {
            callback(error);
        });
}

function createOrder(obj, cb){
        this.getBrandWCPayParams(obj, function (error, responseData) {
            if (error) {
                cb(error);
            } else {

                cb(null, responseData);
            }
        });
}
 // 禁止输入特殊字符 
function filtraTionn(vl) {
	return vl.replace(/[ `~!@#$%^&*()_\-+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '')
}
module.exports = {
	AppID:AppID,
	AppSecret:AppSecret,
	getNonceStr:getNonceStr,
	getSign:getSign,
	getTimestamp:getTimestamp,
	getUserToken:getUserToken,
    getAccessToken: getAccessToken,
	getUserInfo:getUserInfo,
	getJsSdkTicket:getJsSdkTicket,
	getWxPayReturnXmlParams:getWxPayReturnXmlParams,
	getPrepayId:getPrepayId,//统一下单接口
	getProfitsharing:getProfitsharing,
	createProfitsharing:createProfitsharing,
	profitsharingFinish:profitsharingFinish,
	getSmsStr:getSmsStr,
	filtraTionn:filtraTionn
}

