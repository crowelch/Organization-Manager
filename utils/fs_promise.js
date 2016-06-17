var fs = require('fs');

exports.writeFile = function(filename, data) {
   return new Promise(function(resolve, reject) {
      fs.writeFile(filename, data, function(error) {
         if(error) {
            reject(error);
         } else {
            resolve();
         }
      });
   });
};

exports.readFile = function(filename) {
   return new Promise(function(resolve, reject) {
      fs.readFile(filename, function(error, buffer) {
         if(error) {
            reject(error);
         } else {
            resolve(buffer);
         }
      });
   });
};
