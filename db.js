// binding mysql Module
var mysql = require('mysql');

var connection = mysql.createConnection({
  host : '59.187.203.140',
  user:'root',
  password:'kt20112094',
  database:'capstone'
});

exports.connect = function(){
  connection.connect(function(err){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }else{
      console.log("DB connection success!!");
    }
  });
  connection.query('SELECT * FROM user', function(err, res, fields){
      if(err) {
          throw err
      }else {console.log(res)};
  });
  connection.query('SELECT * FROM heartrate_log', function(err, res, fields){
      if(err) {
          throw err
      }else {console.log(res)};
  });
  connection.query('SELECT * FROM activity_log', function(err, res, fields){
      if(err) {
          throw err
      }else {console.log(res)};
  });
  connection.query('SELECT * FROM authentication', function(err, res, fields){
      if(err) {
          throw err
      }else {console.log(res)};
  });
};

exports.getConnection = function(){
  return connection;
};
