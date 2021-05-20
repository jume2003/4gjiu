var cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
const xmlparser = require('express-xml-bodyparser')

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var hearbitRouter = require('./routes/hearbit');
var devicesRouter = require('./routes/devices');
var orderRouter = require('./routes/order');
var ordertempRouter = require('./routes/ordertemp.js');
var productRouter = require('./routes/product.js');
var uploadRouter = require('./routes/upload.js');
var advertisementRouter = require('./routes/advertisement.js');
var smsRouter = require('./routes/sms.js');




var app = express();
/*
//设置跨域访问  
app.all('*', function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "X-Requested-With");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("X-Powered-By",' 3.2.1')  
    res.header("Content-Type", "application/json;charset=utf-8");  
    next();  
}); */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(xmlparser());
app.use(cors({
    origin:['http://sh.zssk.net'],
    methods:['GET','POST'],
    alloweHeaders:['Conten-Type', 'Authorization']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/hearbit', hearbitRouter);
app.use('/devices', devicesRouter);
app.use('/order', orderRouter);
app.use('/ordertemp', ordertempRouter);
app.use('/product', productRouter);
app.use('/upload', uploadRouter);
app.use('/advertisement', advertisementRouter);
app.use('/sms', smsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

