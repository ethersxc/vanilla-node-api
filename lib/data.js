const Promise = require('bluebird')
// const fs = Promise.promisifyAll(require('fs'));
const fs = require('fs');
const path = require('path');
// const helpers = require('./helpers');

// Container for module (to be exported)
var lib = {};
 
// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// WRITE data to a file
lib.create = function(dir, file, data, callback = () => {}){
  // /Users/ether/Documents/node/.data/test/newFile.json
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file');
            }
          });
        } else {
          callback('Error writing in new file');
        }
      });
    } else {
      callback(err)
    }
  })
};

// READ
lib.read = (dir, file, callback = () => {}) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`,'utf8', (err, JSONdata) => {
    if (!err && JSONdata) {
      const data = JSON.parse(JSONdata);
      callback(err, data)
    } else {
      callback(err)
    }
  });
};

// UPDATE (REWRITE) 
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('on writing:', err)
            }
          })
        } else {
          callback('on truncate:', err);
        }
      })
    } else {
      callback('on open:', err);
    }
  });
};

// DELETE
lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (e) => {
    if (!e) {
      callback(false);
    } else {
      callback(e)
    }
  })
}
module.exports = lib;