// binding mysql Module
var mysql = require('mysql');

var connection = mysql.createConnection({
  host : '59.187.203.140',
  user:'root',
  password:'kt20112094',
  database:'capstone_project'
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

exports.isAuthenticated = function(req, res, callback){
    connection.query('SELECT login_id FROM authentication WHERE token='+"'"+req.headers.token+"'", function(err, db, fields){
        var flag;
        if(err){
            console.log('error: '+err);
            throw err;
        }

        if(db.length != 0){
            flag= true;
        }else {
            flag= false;
        }
        callback (flag, db[0].login_id);
    });
}

exports.whatType = function(id, callback){
    connection.query('SELECT user_type FROM user WHERE login_id = '+ "'"+ id +"'", function(err, db, fields){
        if(err){
            console.log('error: '+err);
            throw err;
        }
        callback(db[0].user_type);
    });
}
