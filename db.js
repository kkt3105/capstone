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
};

exports.getConnection = function(){
  return connection;
};
