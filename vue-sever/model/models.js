
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/SkHtDataBase');
mongoose.connection.once("open",function(){
    console.log('数据库连接成功');
});
let WxuserModel = mongoose.model("wxusers",new Schema({
	"hotel_id" : String,
	"seller_id" : String,
    "openid" : String,
    "nickname" : String,
    "sex" : Number,
    "language" : String,
    "city" : String,
    "province" : String,
    "country" : String,
    "headimgurl" : String,
    "privilege" : [],
    "token" : String,
	"smscode":String,
	"smssceond":Number,
	"tel":String
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let ScanDataModel = mongoose.model("scandatas",new Schema({
	"hotel_id" : String,
	"seller_id" : String,
    "wxuser_id" : String,
    "date" : String,
    "device_code" : String,
    "device_id" : String
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let DeviceModel = mongoose.model("devices",new Schema({
	"hotel_id" : String,
	"seller_id" : String,
    "device_code" : String,
    "device_name" : String,
    "device_gps" : String,
	"heartbeat_time":String,
    "is_online" : Boolean,
    "try_count" : Number,
    "total_count" : Number,
    "free_times" : Number,
    "token" : String,
    "opdelay" :{type:Number, default:1000},
    "hbdelay" :{type:Number, default:1000},
    "count" : Number,
	"click" : Number,
    "image_uri" : String,
	"nettype":String,
	"signal":String,
	"devicebindurl":String,
	"deviceqrcode":String,
	"ortem_index":{type:Number, default:0},
	"cmd":{type:String, default:"none"}
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let UserModel = mongoose.model("users",new Schema({
    "name" : String,
    "introduction" : String,
    "avatar" : String,
    "roles" : [],
    "username" : String,
    "password" :String,
    "token" : String,
	"ordertoken":String,
    "enabel" : Boolean,
	"money":Number,
	"openid":String,
	"inviteid":String
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let OrderModel = mongoose.model("orders",new Schema({
    "out_trade_no":String,
	"hotel_id" : String,
	"seller_id" : String,
	"waiter_id" : String,
	"nocestr":String,
    "total_fee":Number,
    "total_price":Number,
    "transaction_id":String,
    "openid":String,
    "tel":String,
    "device_id":String,
	"device_name":String,
	"buyername":String,
    "date":String,
    "paystate":Boolean,
    "state":String,
	"hotel_pay":{type:Number, default:0 },
	"seller_pay":{type:Number, default:0 },
	"waiter_pay":{type:Number, default:0 }
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let OrderDetailedModel = mongoose.model("orderdetaileds",new Schema({
	"product_id":String,
	"name" : String,
	"imgurl" : String,
	"price" : Number,
	"out_trade_no":String,
	"count":Number
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let OrderTempModel = mongoose.model("ordertemps",new Schema({
	"out_trade_no":String,
	"device_code": String,
	"device_id":String,
	"device_name":String,
	"ortem_index":{type:Number, default:0},
	"hotel_id" : {type:String, default:"" },
	"seller_id" : {type:String, default:"" },
	"waiter_id" : {type:String, default:"" },
	"uptime": {type:Number, default:0 },
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let ProfitSharingModel = mongoose.model("profitsharings",new Schema({
	"return_code":String,
	"result_code":String,
	"err_code":String,
	"err_code_des":String,
	"transaction_id":String,
	"out_order_no":String,
	"order_id":String,
	"nonce_str":String,
	"receivers":String,
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))


let ProductModel = mongoose.model("products",new Schema({
	"name" : String,
	"imgurl" : String,
	"hotel_pay":{type:Number, default:0 },
	"seller_pay":{type:Number, default:0 },
	"waiter_pay":{type:Number, default:0 },
	"price" : {type:Number, default:0 },
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))

let AdvertisementModel = mongoose.model("advertisements",new Schema({
	"name" : String,
	"url" : String,
	"index" : Number
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}}))


let HotelsByToken = (token,befor_fun,after_fun)=>
{
	//用token 得到userinfo 再用user_id得到酒店id再用酒店_id得到设备
	UserModel.findOne({token:token},function (err, userinfo) {
		if (err) return handleError(err);
		if(userinfo!=null)
		{
			 const amdwstr = {hwst:{},dwstr:{}}
			 const othwstr = {hwst:{user_id:userinfo._id},dwstr:{hotel_id:0}}
			 var thwstr = othwstr
			 if(userinfo.roles[0]=='admin')thwstr = amdwstr
			 if(befor_fun!=null)
			 befor_fun(thwstr)
			 HotelModel.find(thwstr.hwst,function (err, hotels){
				othwstr.hotel_id = hotels[0]._id
				if(after_fun!=null)
				after_fun(err, hotels,thwstr)
			 })
		}
	})
}
//得到一周数据
let GetWeekDates = (cur_date_tem,SchemaModel,keyword,whstr)=>
{
	//得到今天星期几就后推几天
	cur_date_tem = new Date(cur_date_tem)
	var back_day = cur_date_tem.getDay()+1
	var cur_date = new Date(cur_date_tem)
	var last_date = new Date(cur_date_tem.setDate(-back_day))
	return SchemaModel.aggregate([
		{  
			$match: {created:{
						"$gte": last_date,
						"$lte":cur_date
						}}  
		},
		{
			$match: whstr
		},
		{
			$project :{
				new_time_stamp :{$dayOfWeek:"$created"},
				data :keyword==null?1:"$"+keyword,
			}  
		},
		{
			$group:{_id:'$new_time_stamp',data : {$sum : "$data"},count : {$sum : 1}},
		},
		{
			$sort: {"_id": 1}
		}
		])
}

let MakeWeekDates = (dates,iscount)=>
{
	var ret_dates = [0,0,0,0,0,0,0]
	for(var i in dates)
	{
		ret_dates[dates[i]._id-1] = iscount?dates[i].count:dates[i].data
	}
	return ret_dates
}

let MakeDay24Dates = (dates)=>
{
	var ret_dates = [
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0]
	for(var i in dates)
	{
		var index = parseInt(dates[i]._id)
		ret_dates[index%24] =dates[i].total_fee
	}
	return ret_dates
}

let handleError = (err)=>
{
	console.log(err)
}

exports.handleError = handleError
exports.WxuserModel=WxuserModel;
exports.ScanDataModel=ScanDataModel;
exports.DeviceModel=DeviceModel;
exports.UserModel=UserModel;
exports.OrderModel=OrderModel;
exports.OrderDetailedModel=OrderDetailedModel;
exports.OrderTempModel=OrderTempModel;
exports.ProfitSharingModel=ProfitSharingModel;
exports.ProductModel=ProductModel;
exports.HotelsByToken=HotelsByToken;
exports.GetWeekDates = GetWeekDates
exports.MakeWeekDates = MakeWeekDates
exports.MakeDay24Dates = MakeDay24Dates
exports.AdvertisementModel = AdvertisementModel

