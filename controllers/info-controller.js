var mysql = require('mysql');
var connection = require('../db.js').getConnection();
require('date-utils');

var VolunteerInfoTABLE = 'volunteer_info';
var ManagementInfoTABLE = 'management_info';

function isAuthenticated(req, res, callback){
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

exports.receiveManagementInfo = function (req, res){
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

    isAuthenticated(req, res, function(flag, login_id){
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
