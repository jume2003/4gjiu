var express = require('express')
var router = express.Router()
const request = require('request')
const wxlib = require('../model/wxlib')
const fs=require('fs');
const web_path = '../vue-element-admin/'
const web_url = 'http://sh.zssk.net/'
const img_path = 'upload/imgs/'
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/uploadimg', function(req, res, next) {
	const {imgbase64} = req.body
	var base64Data = imgbase64.replace(/^data:image\/\w+;base64,/, "");
    // 返回一个被 string 的值初始化的新的 Buffer 实例,原始二进制数据存储在 Buffer 类的实例中，        一个 Buffer 类似于一个整数数组，但它对应于 V8 堆内存之外的一块原始内存。
    var dataBuffer = Buffer.from(base64Data, 'base64');
	var filename = wxlib.getNonceStr()+'.jpg'
    fs.writeFile(web_path+img_path+filename, dataBuffer, function(err) {
        if(err){
          res.send({
          result: true,
          code: 50000
          });
        }else{
          res.send({
          result: true,
		  data:web_url+img_path+filename,
          code: 20000
          });
        }
    });

	/*let form = new multiparty.Form();
	  form.parse(req, function(err,fields,file){
	    console.log(fields);
		console.log(file);
		console.log(err);
	    console.log('数据已接收');
	  });*/

});

module.exports = router;
