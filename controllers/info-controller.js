var mysql = require('mysql');
var db=require('../db.js');
var connection = db.getConnection();
require('date-utils');

var VolunteerInfoTABLE = 'volunteer_info';
var ManagementInfoTABLE = 'management_info';



exports.seniorList = function(req, res){
    var db_flag=false;
    var jsonData={};
    jsonData.data = [];

    db.isAuthenticated(req, res, function(flag, login_id){
        jsonData.auth_status=flag;
        if(flag){
            db.whatType(login_id, function(user_type){
                if(user_type == "manager"){
                    connection.query('SELECT senior_id FROM '+ ManagementInfoTABLE +' WHERE manager_id = '+"'"+login_id+"'", function(err, db, fields){
                        if(err){
                            db_flag = false;
                            console.log('ERROR! : '+ err);
                            throw err;
                        }else{
                            for(i=0; i<db.length; i++){
                                connection.query("SELECT * FROM user WHERE login_id = "+ "'" + db[i].senior_id+ "'", function(err, db2, fields){
                                    db_flag = true;

                                    jsonData.data.push(db2[0]);
                                });
                            }
                            console.log("1");
                            console.log(jsonData);
                            jsonData.status = db_flag;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        }
                    });
                }else{
                    connection.query("SELECT * FROM user WHERE user_type = 'senior'", function(err, db, fields){
                        if(err){
                            db_flag = false;
                            console.log('ERROR! : '+ err);
                            throw err;
                        }else{
                            db_flag = true;
                            jsonData.data = db;

                            console.log(jsonData);
                            jsonData.status = db_flag;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
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
            res.writeHead(200, {"Content-Type":"application/json"});
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
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};

exports.receiveVolunteerInfo = function (req, res){
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
                connection.query('SELECT * FROM '+ VolunteerInfoTABLE +' WHERE volunteer_id='+"'"+login_id+"' and start_time > '"+start+"' and start_time < "+"'"+end+"'", function(err, db, fields){
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
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });
};
