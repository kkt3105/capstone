var mysql = require('mysql');
var connection = require('../db.js').getConnection();
require('date-utils');

var HeartRateTABLE = 'heartrate_log';
var SensorDataTABLE = 'activity_log';

function isAuthenticated(req, res, callback){
    connection.query('SELECT login_id FROM authentication WHERE token='+"'"+req.body.token+"'", function(err, db, fields){
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

exports.sendHeartrateLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};

    isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
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
                    login_id:login_id,
                    date:d,
                    heartrate:req.body.heartrate
                };

                connection.query('INSERT INTO ' + HeartRateTABLE + ' SET ?', post, function(err, db2){
                  if(err){
                      db_flag = false;
                      console.log('ERROR! : '+ err);
                      throw err;
                  }else{
                      db_flag = true;
                      console.log('Successfully inserted!');
                  }
                });
            }

    }});


        if(db_flag){
            jsonData.status=true;
        }
        else{
            jsonData.status=false;
        }
        //res.redirect('/');
        res.writeHead(200, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));

};

exports.sendActivityLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};
    isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
                if( req.body.modified_data.length == 0 || req.body.modified_data.length > 10 ){
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
                        login_id:login_id,
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
                          db_flag = true;
                          console.log('Successfully inserted!');
                      }
                    });
                }

        }});

            if(db_flag){
                jsonData.status=true;
            }
            else{
                jsonData.status=false;
            }
            //res.redirect('/');
            res.writeHead(200, {
                "Content-Type":"application/json"
            });
            res.end(JSON.stringify(jsonData));

};
exports.receiveHeartrateLog = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};

    isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            if(req.body.start_of_period != null){
                start = req.body.start_of_period;
            }
            if(req.body.end_of_period != null){
                end = req.body.end_of_period;
            }
                connection.query('SELECT * FROM '+ HeartRateTABLE +' WHERE login_id='+"'"+login_id+"' and date > '"+start+"' and date < "+"'"+end+"'", function(err, db, fields){
                    if(err){
                        db_flag = false;
                        console.log('ERROR! : '+ err);
                        throw err;
                    }else{
                        db_flag = true;
                        console.log('Successfully inserted!');
                    }

                    jsonData.status = db_flag;
                    jsonData.data = db;
                    res.writeHead(200, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                });

        }else {
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};
exports.receiveActivityLog = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};

    isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            if(req.body.start_of_period != null){
                start = req.body.start_of_period;
            }
            if(req.body.end_of_period != null){
                end = req.body.end_of_period;
            }
                connection.query('SELECT * FROM '+ SensorDataTABLE +' WHERE login_id='+"'"+login_id+"' and date > '"+start+"' and date < "+"'"+end+"'", function(err, db, fields){
                    if(err){
                        db_flag = false;
                        console.log('ERROR! : '+ err);
                        throw err;
                    }else{
                        db_flag = true;
                        console.log('Successfully inserted!');
                    }

                    jsonData.status = db_flag;
                    jsonData.data = db;
                    res.writeHead(200, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                });

        }else {
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};
