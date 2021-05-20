var express = require('express');
var router = express.Router();
retdata = {"token":"8788852","cmd":"none","hbdelay":10000,"count":1,"opdelay":15000}

/* GET users listing. */
router.get('/', function(req, res, next) {
  retdata.token = device.token;
  retdata.count = device.count;
  device.count = 0;
  res.send(retdata);
});

module.exports = router;