const { hash, randomString } = require('./helpers');
const _data = require('./data')
const handlers = {}; // library

handlers._users = {};
handlers._tokens = {};


/**
    ??*************    USERS START    *************   
 */

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
          hashedPassword,
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

handlers._users.get = ({queryObject, headers}, callback) => {
  const phone = typeof(queryObject.phone) === 'string' && queryObject.phone.trim().length == 10 ? queryObject.phone.trim() : false;
  
  const token = typeof(headers.token) === 'string' ? headers.token : false;
  if (phone) {
    handlers._tokens.verifyToken(token, phone, (err, data) => {
      if (!err && data) {
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            delete data.hashedPassword
            callback(200, data)
          } else {
            callback(404)
          }
        });
      } else {
        callback(403, {'error': 'missing token or token is invalid'})
      }
    });
  } else {
    callback(400, {'error': 'missed required fields'});
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
      }
      //  else {
      //   console.log(err);
      //   callback(500, {'error': 'could not delete'})
      // }
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


/**
    * ***************    USERS END    *************   
    ??*************    TOKENS START    *************   
 */

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  acceptableMethods.indexOf(data.method) > -1 
    ? handlers._tokens[data.method](data, callback) 
    : callback(405) // method not allowed
}

handlers._tokens.post = (data, callback) => {
  const { payload } = data;
  const password  = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false
  const phone  = typeof(payload.phone) === 'string' && payload.phone.trim().length == 10 ? payload.phone : false

  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        const hashedPassword = hash(password);
        
        if (hashedPassword == userData.hashedPassword) {
          const tokenId = randomString(20);
          // 1 hour
          const expires = Date.now() * 1000 * 60  * 60
          const tokenObject = {
            phone,
            expires,
            tokenId
          }

          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, {'error': 'could not create NEW token'});
            }
          })
        } else {
          callback(400, {'error': 'password is not correct'})
        }
      } else {
        console.log(err, userData, phone);
        callback(400, {'error': 'could not find user'});
      }
    })
  } else {
    callback(400, {'error': 'missing required fields'});
  }
}

handlers._tokens.get = ({queryObject}, callback) => {
  const id = typeof(queryObject.id) === 'string' && queryObject.id.trim().length == 20 ? queryObject.id.trim() : false
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404, {'error': 'token not found'})
      }
    })
  }
}

handlers._tokens.put = ({payload}, callback) => {
  const id = typeof(payload.id) === 'string' && payload.id.trim().length ? payload.id.trim() : false;
  const extended = typeof(payload.extended) === 'boolean' && payload.extended === true ? true : false;

  if (id && extended) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {

        if (token.expires > Date.now()) {
          tokenData.expires = Date.now() * 1000 * 60 * 60;

          _data.update('tokens', id,  tokenData, (err) => {
            if (!err) {
              callback(200)
            } else {
              callback(500, {'error': 'could not update token'})
            }
          })
        } else {
          callback(400, {'error': 'token already expired'})
        }
      } else {
        callback(400, {'error': 'token does not exist'})
      }
    })
  } else {
    callback(400, {'error': 'missing required fields'})
  }
}

handlers._tokens.delete = () => {
    /**
   * !DELETE TOKEN WITH NO "EXPIRES"
   */
  const id = typeof(payload.id) === 'string' && payload.id.trim().length ? payload.id.trim() : false;
  
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {

        _data.update('tokens', id,  tokenData, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, {'error': 'could not delete token'})
          }
        })
      } else {
        callback(400, {'error': 'token does not exist'})
      }
    })
  } else {
    callback(400, {'error': 'missing required fields'})
  }
}

handlers._tokens.verifyToken = (tokenId, phone, callback) => {
  _data.read('tokens', tokenId, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  });
};


/**
    * *************    TOKENS END    *************   
 */

module.exports = handlers