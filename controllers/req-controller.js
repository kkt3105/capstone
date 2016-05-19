var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();
require('date-utils');

exports.request = function(req, res){
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
                            signature: 0
                        };

                        connection.query('INSERT INTO request_list SET ?', post, function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
                                db_flag=true;
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
                            signature: 0
                        };

                        connection.query('INSERT INTO request_list SET ?', post, function(err, db){
                            if(err){
                                db_flag=false;
                                throw err;
                            }else {
                                db_flag=true;
                                console.log('Successfully inserted!');
                            }
                        });
                    }
                });
            }else {
                res.writeHead(200, {"Content-Type":"application/json"});
                res.end(JSON.stringify(jsonData));
            }
        });
}
