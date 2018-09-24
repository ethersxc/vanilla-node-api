const { hash } = require('./helpers');
const _data = require('./data')
const handlers = {}; // library

handlers._users = {};

handlers._users.post = (data, callback) => {
  const { payload } = data;
  const firstName  = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName : false
  const lastName  = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName : false
  const password  = typeof(payload.password) === 'string' && payload.password.trim().length > 9 ? payload.password : false
  const phone  = typeof(payload.phone) === 'number' && payload.phone.trim().length > 0 ? payload.phone : false
  const tosAgreement  = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement.trim().length > 0 ? payload.tosAgreement : false

  if (firstName && lastName && password && phone && tosAgreement) {
    _data.read('users', phone, (e) => {
      if (e) {
        _data.create('users', phone, (e) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, {'errro': 'could not create new user'});
          }
        })
      } else {
        callback(400, {'error': 'phone already taken'});
      }
    })
  } else {
    callback(400, {'error': 'missing required fields'});
  }
}

handlers._users.get = () => {

}
handlers._users.put = () => {

}
handlers._users.delete = () => {

}

handlers.sample = (data, callback) => {
  callback(406, {'name': 'sample handler'});
}

handlers.notFound = (data, callback) => {
  callback(404)
}

handlers.users = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  acceptableMethods.indexOf(data.method) > -1 
    ? handlers._users[data.method](data, callback) 
    : callback(405) // method not allowed
}

module.exports = handlers