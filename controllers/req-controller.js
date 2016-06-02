var fs = require('fs');
var gcm = require('node-gcm');
var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();
require('date-utils');
var reqListTABLE = 'request_list';

var t = setInterval (function(){ // every 5-minutes, Check Req. List to update request which passed 10-minutes
    var db_flag = false;

    var dt = new Date();
    var d = dt.toFormat('YYYYMMDDHH24MISS');
    console.log("Request Status Update every 10-minute!");
    var post={current_status : 2};

    connection.query("UPDATE "+reqListTABLE+ " SET ? where current_status = 0 and "+d+" - timestamp > 1000",post, function(err, db){
        if(err){
            db_flag = false;
        }else{
            console.log("Updated Successfully!");
            db_flag = true;
        }
    });
}, 5*1000*60);

exports.finishRequest = function(req, res){
    var db_flag = false;
    var jsonData = {};
    // login
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            // login_id (senior_id)와 date_from 을 primary로 하여 signature = filepath로 업데이트
            var filename = login_id + "_" +req.body.date_from;
            fs.writeFile("/home/pi/node-capstone/capstone/signatures/" + filename, req.body.encoded_data, 'utf8', function(err){
                if(err){
                    throw err;
                }
                var post={
                    signature:filename
                }
                console.log("File Write Success! "+filename);
                connection.query("UPDATE "+ reqListTABLE + " SET ? WHERE senior_id = '"+login_id+"' AND date_from = '"+req.body.date_from+"';", post, function(err, db){
                  if(err){
                      db_flag = false;
                      console.log('ERROR! : '+ err);
                      throw err;
                  }else{
                      console.log("Successfully Update request_list.signature!");
                      db_flag = true;
                      jsonData.status = db_flag;
                      res.writeHead(200, {"Content-Type":"application/json"});
                      res.end(JSON.stringify(jsonData));
                  }
                });
            });
        }else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}
exports.getSignature = function(req, res){
    var db_flag = false;
    var jsonData = {};
    // login
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            // login_id (senior_id)와 date_from 을 primary로 하여 signature = filepath로 업데이트
            var filename = req.body.senior_id + "_" +req.body.date_from;
            fs.readFile("/home/pi/node-capstone/capstone/signatures/" + filename, 'utf8', function(err,data){
                if(err){
                    res.writeHead(404, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }else{
                    console.log("File Read Success! "+filename);
                    jsonData.data = data;
                    jsonData.status = true;
                    res.writeHead(200, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }

            });
        }else{
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}

exports.accept = function(req, res){
    var db_flag = false;
    var jsonData = {};
    console.log(req.body);
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == "senior"){

                    //update current state = 1
                    var post={
                        current_status:1
                    }
                    connection.query("UPDATE "+ reqListTABLE + " SET ? WHERE senior_id = '"+login_id+"' AND date_from = '"+req.body.date_from+"';", post, function(err, db){
                      if(err){
                          db_flag = false;
                          console.log('ERROR! : '+ err);
                          throw err;
                      }else{
                          console.log("Successfully accept!");
                          db_flag = true;
                          jsonData.status = db_flag;
                          res.writeHead(200, {"Content-Type":"application/json"});
                          res.end(JSON.stringify(jsonData));
                      }
                    });
                }else if (user_type == "volunteer"){
                    //update current state = 1
                    //add volunteer_id
                    var post = {
                        current_status:1,
                        volunteer_id:login_id
                    }
                    connection.query('UPDATE '+ reqListTABLE + ' SET ? WHERE senior_id='+"'"+req.body.senior_id+"' AND date_from= '"+req.body.date_from+"'", post, function(err, db){
                      if(err){
                          db_flag = false;
                          console.log('ERROR! : '+ err);
                          throw err;
                      }else{
                          console.log("Successfully accept!");
                          db_flag = true;
                          jsonData.status = db_flag;
                          res.writeHead(200, {"Content-Type":"application/json"});
                          res.end(JSON.stringify(jsonData));
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

exports.list = function(req, res){
    var db_flag = false;
    var jsonData = {};
    console.log(req.body);
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == "senior"){
                    connection.query('SELECT * FROM request_list A LEFT OUTER JOIN user B ON A.volunteer_id = B.login_id WHERE A.senior_id = '+"'"+login_id+"'", function(err, db){
                        if(err){
                            db_flag=false;
                            throw err;
                        }else {
                            db_flag=true;
                            jsonData.status = db_flag;
                            jsonData.data = db;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        }
                    });
                }else if (user_type == "volunteer"){
                    if(req.body.type == 1){
                        connection.query("SELECT * FROM request_list A INNER JOIN user B ON A.senior_id = B.login_id WHERE A.volunteer_id = '"+login_id+"' and signature != '0'", function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
                                db_flag=true;
                                jsonData.status = db_flag;
                                jsonData.data = db;
                                console.log(db);
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                            }
                        });
                    }else{
                        connection.query('SELECT * FROM request_list A INNER JOIN user B ON A.senior_id = B.login_id WHERE A.volunteer_id = '+"'"+login_id+
                                        "' UNION SELECT * FROM request_list A INNER JOIN user B ON A.senior_id = B.login_id WHERE A.current_status = 0 AND A.req_type = 0", function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
                                db_flag=true;
                                jsonData.status = db_flag;
                                jsonData.data = db;
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                            }
                        });
                    }

                }
            });
        }else {
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
}


exports.request = function(req, res){

    var dt = new Date();
    var d = dt.toFormat('YYYYMMDDHH24MISS');
        var db_flag = false;
        var jsonData = {};
        console.log(req.body);

        db.isAuthenticated(req, res, function(flag, login_id){
            jsonData.auth_status=flag;
            if(flag){
                db.whatType(login_id, function(user_type){
                    if(user_type == "senior"){

                        var post = {
                            req_type: 0,
                            senior_id: login_id,
                            //volunteer_id: ,
                            date_from: req.body.date_from,
                            req_hour:req.body.req_hour*1,
                            date_to: req.body.date_from*1 + req.body.req_hour*100 + "",
                            details: req.body.details,
                            current_status: 0,
                            signature: 0,
                            timestamp:d
                        };

                        connection.query('INSERT INTO request_list SET ?', post, function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {

                                connection.query("SELECT A.latitude, A.longitude, A.user_name FROM user A WHERE login_id = '"+login_id+"'", function(err, db, fields){
                                    if(err){
                                        db_flag = false;
                                        console.log('ERROR! : '+ err);
                                        throw err;
                                    }else{
                                        var mylat=db[0].latitude;
                                        var mylgt=db[0].longitude;
                                        var uname=db[0].user_name;
                                        connection.query("SELECT token FROM authentication A INNER JOIN user B ON A.login_id = B.login_id WHERE B.user_type = 'volunteer' and ( cast ((6371 * acos(cos(radians('"+mylat+"')) * cos(radians(latitude)) * cos(radians(longitude) - radians('"+mylgt+"')) + sin(radians('"+mylat+"')) * sin(radians(latitude)))) as decimal(7,2)) ) < 3", function(err, db){
                                            if(err){
                                                throw err;
                                            }else {
                                                var message = new gcm.Message();
                                                var message = new gcm.Message({
                                                    collapseKey: 'Gcm Test',
                                                    delayWhileIdle: true,
                                                    timeToLive: 3,
                                                    data: {
                                                        data: 'req0',
                                                        name:uname
                                                    }
                                                });
                                                console.log(uname);
                                                var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
                                                var sender = new gcm.Sender(server_api_key);
                                                var registrationIds = [];

                                                for(i=0; i<db.length; i++){
                                                    console.log(i + " 3km 내의 자원봉사자 토큰 " + db[i].token);
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




                                db_flag=true;
                                jsonData.status = db_flag;
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                                console.log('Successfully inserted!');
                            }
                        });

                    }else if(user_type == "volunteer"){

                        var post = {
                            req_type: 1,
                            senior_id: req.body.senior_id,
                            volunteer_id: login_id,
                            date_from: req.body.date_from,
                            req_hour:req.body.req_hour*1,
                            date_to: req.body.date_from*1 + req.body.req_hour*100 + "",
                            details: req.body.details,
                            current_status: 0,
                            signature: 0,
                            timestamp:d
                        };

                        connection.query('INSERT INTO request_list SET ?', post, function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
                                connection.query("SELECT user_name from user where login_id = '"+login_id+"'"){
                                    if(err){
                                        throw err;
                                    }else{
                                        var uname = db[0].user_name;
                                        connection.query("SELECT token FROM authentication where login_id ='" + req.body.senior_id + "'", function(err, db){
                                            if(err){
                                                throw err;
                                            }else {
                                                var message = new gcm.Message();
                                                var message = new gcm.Message({
                                                    collapseKey: 'Gcm Test',
                                                    delayWhileIdle: true,
                                                    timeToLive: 3,
                                                    data: {
                                                        data: 'req1',
                                                        name: uname
                                                    }
                                                });

                                                var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
                                                var sender = new gcm.Sender(server_api_key);
                                                var registrationIds = [];

                                                for(i=0; i<db.length; i++){
                                                    console.log(i + " 해당 노인 토큰 " + db[i].token);
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
                                }


                                db_flag=true;
                                jsonData.status = db_flag;
                                res.writeHead(200, {"Content-Type":"application/json"});
                                res.end(JSON.stringify(jsonData));
                                console.log('Successfully inserted!');
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
