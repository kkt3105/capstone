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
        console.log(db);
    });
}, 5*1000*60);

exports.accept = function(req, res){
    var db_flag = false;
    var jsonData = {};
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == "senior"){

                    //update current state = 1
                    var post={
                        current_status:1
                    }
                    connection.query('UPDATE '+ reqListTABLE + ' SET ? WHERE senior_id='+"'"+login_id+"' AND date_from= '"+req.body.date_from+"'", post, function(err, db){
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
    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            connection.query('SELECT A.current_status, A.senior_id, A.volunteer_id, A.date_from, A.date_to FROM request_list A WHERE senior_id = '+"'"+login_id+"' OR volunteer_id = "+"'"+login_id+"'", function(err, db){
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
                            date_to: req.body.date_to,
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
                            date_to: req.body.date_to,
                            //details: req.body.details,
                            current_status: 0,
                            signature: 0,
                            timestamp:d
                        };

                        connection.query('INSERT INTO request_list SET ?', post, function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
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
