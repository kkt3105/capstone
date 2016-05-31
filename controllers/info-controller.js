var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();
require('date-utils');

var VolunteerInfoTABLE = 'volunteer_info';
var ManagementInfoTABLE = 'management_info';
var SeniorListTABLE = 'senior_list';

exports.setHR = function(req, res){
    var db_flag = false;
    var jsonData = {};

    console.log(req.body);
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == "manager"){
                    connection.query('SELECT * FROM '+ SeniorListTABLE + ' WHERE login_id='+"'"+req.body.senior_id+"'", function(err, db, fields){
                        if(err){
                            db_flag = false;
                            console.log('ERROR! : '+ err);
                            throw err;
                        }else{
                            var post = {
                                login_id:req.body.senior_id,
                                high_zone_2: req.body.high_zone_2,
                                high_zone_1: req.body.high_zone_1,
                                low_zone_1:req.body.low_zone_1
                            }

                            if(db.length == 0){
                                connection.query('INSERT INTO '+ SeniorListTABLE + ' SET ?', post, function(err, db3){
                                  if(err){
                                      db_flag = false;
                                      console.log('ERROR! : '+ err);
                                      throw err;
                                  }else{
                                      console.log("Successfully inserted HR");
                                      db_flag = true;
                                      jsonData.status = db_flag;
                                      res.writeHead(200, {"Content-Type":"application/json"});
                                      res.end(JSON.stringify(jsonData));
                                  }
                                });
                            }else {
                                connection.query('UPDATE '+ SeniorListTABLE + ' SET ? WHERE login_id='+"'"+req.body.senior_id+"'", post, function(err, db2){
                                  if(err){
                                      db_flag = false;
                                      console.log('ERROR! : '+ err);
                                      throw err;
                                  }else{
                                      console.log("Successfully updated HR");
                                      db_flag = true;
                                      jsonData.status = db_flag;
                                      res.writeHead(200, {"Content-Type":"application/json"});
                                      res.end(JSON.stringify(jsonData));
                                  }
                                });
                            }
                        }

                    });
                }
            });
        }else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}
exports.seniorInfo = function(req, res){
        var db_flag = false;
        var jsonData = {};

        console.log(req.body);

        db.isAuthenticated(req, res, function(flag, login_id){
            jsonData.auth_status=flag;
            if(flag){
                db.whatType(login_id, function(user_type){
                    if(user_type == "manager"){
                        connection.query('SELECT * FROM user A INNER JOIN senior_list B ON A.login_id = B.login_id WHERE A.login_id = '+ "'"+req.body.senior_id+"'" , function(err, db, fields){
                            if(err){
                                db_flag = false;
                                console.log('ERROR! : '+ err);
                                throw err;
                            }else{
                                db_flag = true;
                                jsonData.data = db;
                                jsonData.status = db_flag;
                                console.log(jsonData.data);
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                            }
                        });
                    }else if(user_type == "senior"){

                        connection.query('SELECT * FROM user A INNER JOIN senior_list B ON A.login_id = B.login_id WHERE A.login_id = '+ "'"+login_id+"'" , function(err, db, fields){
                                if(err){
                                    db_flag = false;
                                    console.log('ERROR! : '+ err);
                                    throw err;
                                }else{
                                    db_flag = true;
                                    jsonData.data = db;
                                    jsonData.status = db_flag;
                                    console.log(jsonData.data);
                                    res.writeHead(200, {"Content-Type":"application/json"});
                                    res.end(JSON.stringify(jsonData));
                                }
                            });
                    }else{
                        connection.query('SELECT * FROM user A WHERE A.login_id = '+ "'"+req.body.senior_id+"'" , function(err, db, fields){
                            if(err){
                                db_flag = false;
                                console.log('ERROR! : '+ err);
                                throw err;
                            }else{
                                db_flag = true;
                                jsonData.data = db;
                                jsonData.status = db_flag;
                                console.log(jsonData.data);
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                            }
                        });
                    }
                });
            }else {
                res.writeHead(404, {"Content-Type":"application/json"});
                res.end(JSON.stringify(jsonData));
            }
        });
}

exports.seniorList = function(req, res){
    var db_flag=false;
    var jsonData={};

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                console.log(user_type +"");
                if(user_type == "manager"){
                    connection.query('SELECT * FROM user A WHERE A.login_id IN (SELECT senior_id FROM '+ ManagementInfoTABLE +' WHERE manager_id = '+"'"+login_id+"')", function(err, db, fields){
                        if(err){
                            db_flag = false;
                            console.log('ERROR! : '+ err);
                            throw err;
                        }else{
                            console.log(db);
                            db_flag = true;
                            jsonData.data = db;
                            jsonData.status = db_flag;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        }
                    });
                }else{
                    connection.query("SELECT A.latitude, A.longitude FROM user A WHERE login_id = '"+login_id+"'", function(err, db, fields){
                        if(err){
                            db_flag = false;
                            console.log('ERROR! : '+ err);
                            throw err;
                        }else{
                            var mylat=db[0].latitude;
                            var mylgt=db[0].longitude;

                            connection.query("SELECT *, (    cast ((6371 * acos(cos(radians('"+mylat+"')) * cos(radians(latitude)) * cos(radians(longitude) - radians('"+mylgt+"')) + sin(radians('"+mylat+"')) * sin(radians(latitude)))) as decimal(7,2)) ) AS distance FROM user WHERE user_type = 'senior' and login_id <> '"+login_id+"' HAVING distance < 3 ORDER BY distance", function(err, db2, fields){
                                if(err){
                                    db_flag = false;
                                    console.log('ERROR! : '+ err);
                                    throw err;
                                }else{
                                    db_flag = true;
                                    jsonData.data = db2;
                                    jsonData.status = db_flag;
                                    res.writeHead(200, {"Content-Type":"application/json"});
                                    res.end(JSON.stringify(jsonData));
                                }
                            });
                        }
                    });
                }
            });
        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}
exports.sendManagementInfo = function(req, res){
    // req.body.senior_id
    var db_flag=false;
    var jsonData={};
    var dt = new Date();
    var d = dt.toFormat('YYYYMMDDHH24MISS');

    db.isAuthenticated(req, res ,function(flag, login_id){
        jsonData.auth_status = flag;
        if(flag){
            console.log('Authenticated User');
            db.whatType(login_id, function(user_type){
                if(user_type == 'manager'){
                    connection.query('SELECT * FROM user WHERE login_id= '+"'"+req.body.senior_id+"'", function(err, db, fields){
                        if(err){
                            throw err;
                        }
                        if(db.length != 0){
                            db_flag = true;
                            var post = {
                                manager_id:login_id,
                                senior_id:req.body.senior_id,
                                date:d
                            };
                            connection.query('INSERT INTO management_info SET ?', post, function(err, db2){
                                if(err){
                                    db_flag=false;
                                    throw err;
                                }else {
                                    db_flag=true;
                                    console.log('Successfully inserted!');
                                }
                            });
                        }
                        if(db_flag){
                            jsonData.status = true;
                        }else {
                            jsonData.status = false;
                        }
                        res.writeHead(200, {"Content-Type":"application/json"});
                        res.end(JSON.stringify(jsonData));
                    });
                }
            });

        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}

exports.receiveManagementInfo = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            if(req.body.start_of_period != null){
                start = req.body.start_of_period;
            }
            if(req.body.end_of_period != null){
                end = req.body.end_of_period;
            }
                connection.query('SELECT * FROM '+ ManagementInfoTABLE +' WHERE manager_id='+"'"+login_id+"' and date > '"+start+"' and date < "+"'"+end+"'", function(err, db, fields){
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

        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};

exports.receiveVolunteerInfo = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};
    var query="";

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            if(req.body.start_of_period != null){
                start = req.body.start_of_period;
            }
            if(req.body.end_of_period != null){
                end = req.body.end_of_period;
            }
            if(req.body.type == 1){
                query = 'SELECT sum(req_hour) as sum FROM request_list WHERE volunteer_id='+"'"+login_id+"' and date_from > '"+start+"' and date_from < "+"'"+end+"' and current_status = 1 and signature != '0'";
            }else{
                query = 'SELECT * FROM request_list WHERE volunteer_id='+"'"+login_id+"' and date_from > '"+start+"' and date_from < "+"'"+end+"'"
            }
                connection.query(query, function(err, db, fields){
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

        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};

exports.totalVolunteerTime = function (req, res){
    var db_flag = false;
    var start = 2000;
    var end = 2999;
    var jsonData = {};

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            if(req.body.start_of_period != null){
                start = req.body.start_of_period;
            }
            if(req.body.end_of_period != null){
                end = req.body.end_of_period;
            }
                connection.query('SELECT sum(req_hour) as total FROM request_list WHERE volunteer_id='+"'"+login_id+"' and current_status = 1 and signature != '0'", function(err, db, fields){
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

        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};
