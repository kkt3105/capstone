var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();
var gcm = require('node-gcm');
require('date-utils');

var HeartRateTABLE = 'heartrate_log';
var SensorDataTABLE = 'activity_log';



exports.sendHeartrateLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};
            console.log("Heartrate: " + req.body.heartrate);
            if( req.body.heartrate <=0 || req.body.heartrate > 999 ){
                    condition = false;
                    console.log('HR is out of range!');

            }else {
                condition = true;
            }

            var dt = new Date();
            var d = dt.toFormat('YYYYMMDDHH24MISS');
            if (condition){
                var post = {
                    login_id:req.body.senior_id,
                    date:d,
                    heartrate:req.body.heartrate
                };

                connection.query('INSERT INTO ' + HeartRateTABLE + ' SET ?', post, function(err, db2){
                  if(err){
                      db_flag = false;
                      console.log('ERROR! : '+ err);
                      throw err;
                  }else{

                      connection.query("SELECT high_zone_2, high_zone_1, low_zone_1, A.user_name FROM user A INNER JOIN senior_list B ON A.login_id = B.login_id WHERE A.login_id = '"+req.body.senior_id+"'", function(err, db, fields){
                          if(err){
                              db_flag = false;
                              console.log('ERROR! : '+ err);
                              throw err;
                          }else{
                              var hr = req.body.heartrate;
                              var h2=db[0].high_zone_2;
                              var h1=db[0].high_zone_1;
                              var l1=db[0].low_zone_1;
                              var uname = db[0].user_name;
                              console.log("1"+uname);
                              if(hr >= h2){
                                  jsonData.hr_status = 2

                              }else if(hr < h2 && hr >= h1){
                                  jsonData.hr_status = 1

                              }else if(hr < h1 && hr > l1){
                                  jsonData.hr_status = 0

                              }else if(hr <= l1){
                                  jsonData.hr_status = -1

                              }
                              if (jsonData.hr_status == 2 || jsonData.hr_status == -1){
                                  //관리사 요청
                                  connection.query("SELECT token FROM authentication A INNER JOIN management_info B ON A.login_id = B.manager_id WHERE B.senior_id = '"+req.body.senior_id+"'", function(err, db){
                                      if(err){
                                          throw err;
                                      }else {
                                          var message = new gcm.Message();
                                          var message = new gcm.Message({
                                              collapseKey: 'Gcm Test',
                                              delayWhileIdle: true,
                                              timeToLive: 3,
                                              data: {
                                                  data: 'high2',
                                                  name: uname
                                              }
                                          });
                                          console.log("2"+uname);

                                          var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
                                          var sender = new gcm.Sender(server_api_key);
                                          var registrationIds = [];

                                          for(i=0; i<db.length; i++){
                                              console.log(i + " 담당관리사 토큰 " + db[i].token);
                                              registrationIds.push(db[i].token);
                                          }
                                          if(db.length != 0){
                                              sender.send(message, registrationIds, 4, function (err, result) {
                                                  console.log(result);
                                              });
                                          }
                                      }
                                  });
                              }else if(jsonData.hr_status == 1){
                                  //주변 독거노인
                                  connection.query("SELECT A.latitude, A.longitude FROM user A WHERE login_id = '"+req.body.senior_id+"'", function(err, db, fields){
                                      if(err){
                                          db_flag = false;
                                          console.log('ERROR! : '+ err);
                                          throw err;
                                      }else{
                                          var mylat=db[0].latitude;
                                          var mylgt=db[0].longitude;

                                          connection.query("SELECT token FROM authentication A INNER JOIN user B ON A.login_id = B.login_id WHERE (B.user_type = 'senior' or B.user_type = 'volunteer') and A.login_id != '"+req.body.senior_id+"' and ( cast ((6371 * acos(cos(radians('"+mylat+"')) * cos(radians(latitude)) * cos(radians(longitude) - radians('"+mylgt+"')) + sin(radians('"+mylat+"')) * sin(radians(latitude)))) as decimal(7,2)) ) < 3", function(err, db){
                                              if(err){
                                                  throw err;
                                              }else {
                                                  var message = new gcm.Message();
                                                  var message = new gcm.Message({
                                                      collapseKey: 'Gcm Test',
                                                      delayWhileIdle: true,
                                                      timeToLive: 3,
                                                      data: {
                                                          data: 'high1',
                                                          name: uname
                                                      }
                                                  });

                                                  var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
                                                  var sender = new gcm.Sender(server_api_key);
                                                  var registrationIds = [];

                                                  for(i=0; i<db.length; i++){
                                                      console.log(i + " 3km 내의 독거노인 토큰 " + db[i].token);
                                                      registrationIds.push(db[i].token);
                                                  }
                                                  if(db.length != 0){
                                                      sender.send(message, registrationIds, 4, function (err, result) {
                                                          console.log(result);
                                                      });
                                                  }
                                              }
                                          });
                                      }
                                  });
                              }
                              console.log("jsonData.hr_status : "+jsonData.hr_status);
                              console.log('Successfully inserted!');
                              db_flag=true;
                              jsonData.status = db_flag;
                              res.writeHead(200, {"Content-Type":"application/json"});
                              res.end(JSON.stringify(jsonData));
                          }
                      });
                      //
                    //   console.log('Successfully inserted!');
                    //   db_flag=true;
                    //   jsonData.status = db_flag;
                    //   res.writeHead(200, {"Content-Type":"application/json"});
                    //   res.end(JSON.stringify(jsonData));
                  }
                });
            }else{
                jsonData.status = db_flag;
                res.writeHead(404, {"Content-Type":"application/json"});
                res.end(JSON.stringify(jsonData));
            }


};

exports.sendActivityLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};

                if( req.body.modified_data < 0 || req.body.modified_data > 9 ){
                        condition = false;
                        console.log('Modified_data is out of range!');

                }else if( req.body.type_of_sensor < 0 || req.body.type_of_sensor > 9 ){
                        condition = false;
                        console.log('Type_of_sensor is out of range!');

                }else {
                    condition = true;
                }

                var dt = new Date();
                var d = dt.toFormat('YYYYMMDDHH24MISS');
                if (condition){
                    var post = {
                        login_id:req.body.senior_id,
                        type_of_sensor:req.body.type_of_sensor,
                        date:d,
                        modified_data:req.body.modified_data
                    };

                    connection.query('INSERT INTO ' + SensorDataTABLE + ' SET ?', post, function(err, db2){
                      if(err){
                          db_flag = false;
                          console.log('ERROR! : '+ err);
                          throw err;
                      }else{
                          console.log('Successfully inserted!');
                          db_flag=true;
                          jsonData.status = db_flag;
                          res.writeHead(200, {"Content-Type":"application/json"});
                          res.end(JSON.stringify(jsonData));
                      }
                    });
                }else{
                    jsonData.status = db_flag;
                    res.writeHead(404, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }


};

exports.receiveAvgHeartrateLog = function(req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};
    var qstring ="";

    console.log(req.body);

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == 'manager'){
                    qstring = 'SELECT *, avg(heartrate) as avgHR FROM heartrate_log WHERE login_id='+"'"+req.body.senior_id+"'";

                }else if(user_type = 'senior'){
                    qstring = 'SELECT *, avg(heartrate) as avgHR FROM heartrate_log WHERE login_id='+"'"+login_id+"'";

                }else {
                    res.writeHead(404, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }
                    if(req.body.start_of_period != null){
                        start = req.body.start_of_period;
                    }
                    if(req.body.end_of_period != null){
                        end = req.body.end_of_period;
                    }

                    if(req.body.start_of_period == null & req.body.end_of_period == null){
                        qstring += " order by date desc limit 0,1";
                    }else {
                        qstring += " and date > '"+start+"' and date < "+"'"+end+"'";
                    }
                        connection.query(qstring+"", function(err, db, fields){
                            if(err){
                                db_flag = false;
                                console.log('ERROR! : '+ err);
                                throw err;
                            }else{
                                db_flag = true;
                                console.log('Success!');
                            }

                            jsonData.status = db_flag;
                            jsonData.data = db;
                            console.log(db);
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        });
            });



        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};

exports.receiveHeartrateLog = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};
    var qstring ="";
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == 'manager'){
                    qstring = 'SELECT * FROM heartrate_log WHERE login_id='+"'"+req.body.senior_id+"'";

                }else if(user_type = 'senior'){
                    qstring = 'SELECT * FROM heartrate_log WHERE login_id='+"'"+login_id+"'";

                }else {
                    res.writeHead(404, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }
                    if(req.body.start_of_period != null){
                        start = req.body.start_of_period;
                    }
                    if(req.body.end_of_period != null){
                        end = req.body.end_of_period;
                    }

                    if(req.body.start_of_period == null & req.body.end_of_period == null & req.body.num == null){
                        qstring += " order by date desc limit 0,1";
                    }else if(req.body.start_of_period == null & req.body.end_of_period == null & req.body.num != null){
                        qstring += " order by date desc limit 0,"+req.body.num;
                    }else {
                        qstring += " and date > '"+start+"' and date < "+"'"+end+"'";
                    }
                        connection.query(qstring+"", function(err, db, fields){
                            if(err){
                                db_flag = false;
                                console.log('ERROR! : '+ err);
                                throw err;
                            }else{
                                db_flag = true;
                                console.log('Success!');
                            }

                            jsonData.status = db_flag;
                            jsonData.data = db;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        });
            });



        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};

exports.receiveActivityLog = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};
    var qstring ="";
    console.log(req.body);
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == 'manager'){
                    qstring = 'SELECT * FROM activity_log WHERE login_id='+"'"+req.body.senior_id+"'";

                }else if(user_type == 'senior'){
                    qstring = 'SELECT * FROM activity_log WHERE login_id='+"'"+login_id+"'";

                }else{
                        res.writeHead(404, {"Content-Type":"application/json"});
                        res.end(JSON.stringify(jsonData));
                }
                    if(req.body.start_of_period != null){
                        start = req.body.start_of_period;
                    }
                    if(req.body.end_of_period != null){
                        end = req.body.end_of_period;
                    }
                    if(req.body.type_of_sensor != null){
                        qstring += " and type_of_sensor = '"+req.body.type_of_sensor+"'";
                    }

                    if(req.body.start_of_period == null & req.body.end_of_period == null){
                        qstring += " order by date desc limit 0,1";
                    }else {
                        qstring += " and date > '"+start+"' and date < "+"'"+end+"'";
                    }
                        connection.query(qstring+"", function(err, db, fields){
                            if(err){
                                db_flag = false;
                                console.log('ERROR! : '+ err);
                                throw err;
                            }else{
                                db_flag = true;
                                console.log('Success!');
                            }

                            jsonData.status = db_flag;
                            jsonData.data = db;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        });
            });

    }else {
        res.writeHead(404, {"Content-Type":"application/json"});
        res.end(JSON.stringify(jsonData));
    }
});
};
