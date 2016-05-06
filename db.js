// binding mysql Module
var mysql = require('mysql');

var connection = mysql.createConnection({
  host : '127.0.0.1',
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

  connection.query('SELECT * from user', function(err, res, fields){
// error will be an Error if one occurred during the query
// results will contain the results of the query
// fields will contain information about the returned results fields (if any)
    if(err){
      throw err;
    }
     console.log('--------------------user-list---------------------');
     console.log(res);
     console.log('----------------------------------------------------');
  });
};

exports.getConnection = function(){
  return connection;
};
