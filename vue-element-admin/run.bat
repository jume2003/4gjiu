{
  appid: 'wx679688f5b39e179e',
  attach: 'test',
  body: 'test',
  mch_id: '1607671006',
  detail: 'test',
  nonce_str: 'diXDtCclHZBUVaPv',
  notify_url: 'http://www.baidu.com',
  openid: 'oFSzmvj6DKOAfVyDcgcvX_TaqNVA',
  out_trade_no: '1415659990',
  spbill_create_ip: '14.23.150.211',
  total_fee: 1,
  trade_type: 'JSAPI',
  sign: 'C6ABE582A6E74BF4300319FE1EED430B'
}


'<xml> ' +
    '<appid>'+'<![CDATA['+AppID+']]>'+'</appid> ' +
    '<body>'+'<![CDATA['+obj.body+']]>'+'</body> ' +
    '<mch_id>'+'<![CDATA['+MchID+']]>'+'</mch_id> ' +
    '<nonce_str>'+'<![CDATA['+obj.nonce_str+']]>'+'</nonce_str> ' +
    '<notify_url>'+'<![CDATA['+obj.notify_url+']]>'+'</notify_url>' +
    '<openid>'+'<![CDATA['+obj.openid+']]>'+'</openid> ' +
    '<out_trade_no>'+'<![CDATA['+obj.out_trade_no+']]>'+'</out_trade_no>'+
	'<sign>'+obj.sign+'</sign> ' +
    '<spbill_create_ip>'+'<![CDATA['+obj.spbill_create_ip+']]>'+'</spbill_create_ip> ' +
    '<total_fee>'+'<![CDATA['+obj.total_fee+']]>'+'</total_fee> ' +
    '<trade_type>'+'<![CDATA['+obj.trade_type+']]>'+'</trade_type> ' +
    '</xml>';