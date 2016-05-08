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
  connection.query('SHOW TABLES;', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Table List------------------")
          console.log(res)
          console.log();
      };
  });

  connection.query('SELECT * FROM user', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------User List------------------")
          console.log(res)
          console.log();
      };
  });
  connection.query('SELECT * FROM senior_list', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Senior List------------------")
          console.log(res)
          console.log();
      };
  });
  connection.query('SELECT * FROM volunteer_list', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Volunteer List------------------")
          console.log(res)
          console.log();
      };
  });
  connection.query('SELECT * FROM manager_list', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Manager List------------------")
          console.log(res)
          console.log();
      };
  });

  connection.query('SELECT * FROM management_info', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Management Info------------------")
          console.log(res)
          console.log();
      };
  });

  connection.query('SELECT * FROM volunteer_info', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------Volunteer Info------------------")
          console.log(res)
          console.log();
      };
  });


  connection.query('SELECT * FROM heartrate_log', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------HR_LOG List------------------")
          console.log(res)
          console.log();
      };
  });
  connection.query('SELECT * FROM activity_log', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------ACTIVITY_LOG List------------------")
          console.log(res)
          console.log();
      };
  });
  connection.query('SELECT * FROM authentication', function(err, res, fields){
      if(err) {
          throw err
      }else {
          console.log("------------------AUTHENTICATION List------------------")
          console.log(res)
          console.log();
      };
  });
};

exports.getConnection = function(){
  return connection;
};
