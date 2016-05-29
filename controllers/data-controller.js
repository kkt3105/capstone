var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();

require('date-utils');

var HeartRateTABLE = 'heartrate_log';
var SensorDataTABLE = 'activity_log';



exports.sendHeartrateLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};

    db.isAuthenticated(req, res, function(flag, login_id){
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
        }else{
                res.writeHead(404, {"Content-Type":"application/json"});
                res.end(JSON.stringify(jsonData));
        }
    });

};

exports.sendActivityLog = function (req, res){
    var db_flag = false;
    var condition = false;
    var jsonData={};
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
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

        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }

    });

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
