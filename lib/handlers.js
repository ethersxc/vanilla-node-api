const { hash } = require('./helpers');
const _data = require('./data')
const handlers = {}; // library

handlers._users = {};

handlers._users.post = (data, callback) => {
  const { payload } = data;
  const firstName  = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName : false
  const lastName  = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName : false
  const password  = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false
  const phone  = typeof(payload.phone) === 'string' && payload.phone.trim().length == 10 ? payload.phone : false
  const tosAgreement  = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement > 0 ? payload.tosAgreement : false

  if (firstName && lastName && password && phone && tosAgreement) {
    _data.read('users', phone, (e) => {
      if (e) {
        const hashedPassword = hash(password);

        const dataObj = {
          firstName,
          lastName,
          password: hashedPassword,
          phone,
          tosAgreement
        }

        _data.create('users', phone, dataObj, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, {'error': 'could not create new user'});
          }
        })
      } else {
        callback(400, {'error': 'phone already taken'});
      }
    })
  } else {
    console.log(firstName , lastName , password , phone , tosAgreement)
    callback(400, {'error': 'missing required fields'});
  }
};

handlers._users.get = ({queryObject}, callback) => {
  const phone = typeof(queryObject.phone) === 'string' && queryObject.phone.trim().length == 10 ? queryObject.phone.trim() : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(404, {'error': 'user is not exist'});
      }
    })
  } else {
    callback(404, {'error': 'phone is not correct'});
  }
};

handlers._users.put = ({payload}, callback) => {
  // @required (id)
  const phone = typeof(payload.phone) === 'string' && payload.phone.length > 0 ? payload.phone : false;
  
  const firstName = typeof(payload.firstName) === 'string' && payload.firstName.length > 0 ? payload.firstName : false;
  const lastName = typeof(payload.lastName) === 'string' && payload.lastName.length > 0 ? payload.lastName : false;
  const password = typeof(payload.password) === 'string' && payload.password.length > 0 ? payload.password : false;
  if (phone) {
    if (firstName || lastName || password) {
      _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            if (firstName) {
              userData.firstName = firstName
            }
            if (lastName) {
              userData.lastName = lastName
            }
            if (password) {
              userData.password = hash(password)
            }
            _data.update('users', phone, userData, (err) => {
              if (!err && userData) {
                callback(200)
              } else {
                console.log(err);
                callback(500, {'error': 'could not update'})
              }
            })
          } else {
            callback(400, {'error': 'user does not exist'});
          }
        })
      } else {
        callback(400, {'error': 'no fields to change'});
      }
    } else {
      callback(400, {'error': 'missing requried field'});
  }
};

handlers._users.delete = ({payload}, callback) => {
  const phone = typeof(payload.phone) === 'string' && payload.phone.length > 0 ? payload.phone : false;
  if (phone) {
    _data.delete('users', phone, err => {
      if (!err) {
        callback(200)
      } else {
        console.log(err);
        callback(500, {'error': 'could not delete'})
      }
    })
  }
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