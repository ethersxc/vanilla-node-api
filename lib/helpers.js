const crypto = require('crypto');
const config = require('../config');

const helpers = {};

helpers.hash = str => {
  if (typeof(str) === 'string' && str.trim().length > 0) {
    const hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
    return hash
  } else {
    return false
  }
};

helpers.parseJsonToObject = str => {
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

helpers.randomString = (len = 10) => {
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randomstring = '';
  
	for (let i=0; i<len; i++) {
		let rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring
};

module.exports = helpers